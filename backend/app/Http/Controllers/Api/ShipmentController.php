<?php

namespace App\Http\Controllers\Api;

use App\Models\Shipment;
use App\Models\Document;
use App\Models\Ticket;
use App\Models\Partner;
use App\Http\Resources\TrackingEventResource;
use App\Services\Shipment\ShipmentEngine;
use App\Services\Orchestration\OrchestrationEngine;
use App\Services\Tracking\TrackingService;
use App\Services\Document\DocumentVault;
use App\Services\Support\TicketsService;
use App\Services\Billing\BillingService;
use Illuminate\Http\Request;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Storage;
use App\Services\Shipment\ShipmentStateMachine;

class ShipmentController extends ApiController
{
    protected $shipmentEngine;
    protected $orchestrationEngine;
    protected $trackingService;
    protected $documentVault;
    protected $ticketsService;
    protected $billingService;

    public function __construct(
        ShipmentEngine $shipmentEngine,
        OrchestrationEngine $orchestrationEngine,
        TrackingService $trackingService,
        DocumentVault $documentVault,
        TicketsService $ticketsService,
        BillingService $billingService
    ) {
        $this->shipmentEngine = $shipmentEngine;
        $this->orchestrationEngine = $orchestrationEngine;
        $this->trackingService = $trackingService;
        $this->documentVault = $documentVault;
        $this->ticketsService = $ticketsService;
        $this->billingService = $billingService;
    }

    public function index(Request $request)
    {
        $shipments = $this->shipmentEngine->listForUser($request->user(), $request->all());
        return ApiResponse::ok($shipments);
    }

    public function show($id, Request $request)
    {
        $shipment = Shipment::with(['customer', 'creator', 'assignments.partner', 'tickets.comments', 'invoices.items', 'events', 'documents'])->findOrFail($id);
        
        $this->authorize('view', $shipment);

        // Masking for partners if it's an RFQ they aren't assigned to
        // Admin/Ops see everything
        if ($request->user()->role === 'partner' && !in_array($request->user()->role, ['admin', 'ops'])) {
            $isAssigned = $shipment->assignments()->whereHas('partner', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })->exists();

            if (!$isAssigned && ($shipment->status === 'rfq' || $shipment->status === 'pending')) {
                // Mask sensitive info
                $shipment->customer_id = null;
                $shipment->description = 'SENSITIVE DATA MASKED';
                $shipment->internal_value = null;
            }
        }

        return ApiResponse::ok($shipment);
    }

    public function store(Request $request)
    {
        $request->validate([
            'origin' => 'required|string',
            'destination' => 'required|string',
            'total_weight' => 'nullable|numeric|min:0',
            'volume' => 'nullable|numeric|min:0',
            'mode' => 'nullable|string|in:sea,air,land',
            'service_type' => 'nullable|string',
            'customer_price' => 'nullable|numeric|min:0',
            'cargo_type' => 'nullable|string',
            'internal_value' => 'nullable|numeric|min:0',
            'pallet_count' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'customer_id' => 'nullable|exists:users,id',
            'status' => 'nullable|string',
            'pickup_date' => 'nullable|date',
        ]);

        $shipment = $this->shipmentEngine->create($request->all(), $request->user());
        return ApiResponse::created($shipment);
    }

    public function update(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        
        $this->authorize('update', $shipment);

        $request->validate([
            'status' => 'required|string|in:rfq,offers_received,offer_selected,processing,transit,at_destination,delivered,closed,cancelled'
        ]);
        
        // Admin/Ops can bypass strict state machine if necessary (force transition)
        $isAdmin = in_array($request->user()->role, ['admin', 'ops']);

        try {
            if ($isAdmin) {
                $shipment->update(['status' => $request->status]);
            } else {
                $shipment = ShipmentStateMachine::transition($shipment, $request->status);
            }
        } catch (\Exception $e) {
            return ApiResponse::error('INVALID_TRANSITION', $e->getMessage(), [], 422);
        }
        
        return ApiResponse::ok($shipment);
    }

    public function quotes(Request $request)
    {
        $quotes = $this->orchestrationEngine->simulateQuotes($request->all());
        return ApiResponse::ok($quotes);
    }

    public function assignPartner(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        
        $this->authorize('update', $shipment);

        $request->validate(['partner_id' => 'required|exists:partners,id', 'leg_type' => 'required|string']);
        $assignment = $this->orchestrationEngine->assignPartner($shipment, $request->all());
        
        // Create Work Order (P0-5)
        \App\Models\WorkOrder::updateOrCreate(
            ['shipment_id' => $shipment->id],
            ['partner_id' => $request->partner_id, 'status' => 'active']
        );

        // Transition to processing if in offer_selected
        if ($shipment->status === 'offer_selected') {
            ShipmentStateMachine::transition($shipment, ShipmentStateMachine::STATUS_PROCESSING);
        }
        
        return ApiResponse::created($assignment);
    }

    // validateShipmentAccess removed in favor of Policies

    public function getAssignments($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('view', $shipment);
        return ApiResponse::ok($shipment->assignments()->with('partner')->get());
    }

    public function getEvents($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('view', $shipment);
        $events = $this->trackingService->getEvents($shipment);
        return ApiResponse::ok(TrackingEventResource::collection($events));
    }

    public function addEvent(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('addEvent', $shipment);

        $request->validate([
            'status_code' => 'required|string',
            'location' => 'nullable|string',
            'description' => 'required|string',
        ]);

        $event = $this->trackingService->addEvent($shipment, $request->all(), $request->user()->id);
        
        // Auto-transition from processing to transit on first event
        if ($shipment->status === 'processing') {
            ShipmentStateMachine::transition($shipment, ShipmentStateMachine::STATUS_TRANSIT);
        }

        return ApiResponse::created(new TrackingEventResource($event));
    }

    public function getDocuments($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('viewDocuments', $shipment);
        return ApiResponse::ok($this->documentVault->list($shipment));
    }

    public function uploadDocument(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('uploadDocument', $shipment);

        $request->validate([
            'file' => 'required|file|max:5120',
            'type' => 'required|string',
        ]);

        $document = $this->documentVault->upload($shipment, $request->file('file'), $request->type, $request->user()->id);
        return ApiResponse::created($document);
    }

    public function downloadDocument($id, Request $request)
    {
        $document = Document::with('shipment')->findOrFail($id);
        $this->authorize('viewDocuments', $document->shipment);
        return Storage::disk('public')->download($document->file_path);
    }

    public function getTickets($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('viewTickets', $shipment);
        return ApiResponse::ok($this->ticketsService->list($shipment));
    }

    public function createTicket(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        $this->authorize('createTicket', $shipment);

        $request->validate(['subject' => 'required|string']);
        $ticket = $this->ticketsService->create($shipment, $request->all(), $request->user()->id);
        return ApiResponse::created($ticket);
    }

    public function updateTicket(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        
        // RBAC: Ops/Admin to resolve
        if (!in_array($request->user()->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Only Ops/Admin can update ticket status', [], 403);
        }

        $request->validate(['status' => 'required|string']);

        if ($request->status === 'resolved') {
            $this->ticketsService->resolve($ticket);
        }

        return ApiResponse::ok($ticket);
    }

    public function addTicketComment(Request $request, $id)
    {
        $ticket = Ticket::with('shipment')->findOrFail($id);
        $this->authorize('createTicket', $ticket->shipment);

        $request->validate(['body' => 'required|string']);
        $comment = $this->ticketsService->addComment($ticket, $request->body, $request->user()->id);
        return ApiResponse::created($comment);
    }

    public function getInvoice(Shipment $shipment, Request $request)
    {
        $this->authorize('viewInvoice', $shipment);
        return ApiResponse::ok($this->billingService->getInvoice($shipment));
    }

    public function generateInvoice(Request $request, Shipment $shipment)
    {
        $this->authorize('update', $shipment);

        $invoice = $this->billingService->generate($shipment, $request->user()->id);
        return ApiResponse::created($invoice);
    }

    public function getPartners(Request $request)
    {
        $user = $request->user();
        $isAdmin = in_array($user->role, ['admin', 'ops']);

        $query = \App\Models\Partner::with('user');

        if (!$isAdmin) {
            // Only verified partners for others
            $query->where('is_verified', true)
                ->whereHas('user', function ($q) {
                    $q->where('role', 'partner');
                });
        }

        $partners = $query->get();
        return ApiResponse::ok($partners);
    }

    public function getAuditLogs(Request $request)
    {
        // RBAC: Ops/Admin only
        if (!in_array($request->user()->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $logs = \App\Models\AuditLog::with('user')->latest()->limit(50)->get();
        return ApiResponse::ok($logs);
    }
}
