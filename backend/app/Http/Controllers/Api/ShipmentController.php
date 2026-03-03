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
use Illuminate\Support\Facades\Storage;
use App\Support\ApiResponse;

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
        
        // RBAC: Customer only sees own, Partner only sees assigned or RFQs
        $user = $request->user();
        if ($user->role === 'customer' && $shipment->customer_id !== $user->id) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to this shipment', [], 403);
        }

        if ($user->role === 'partner') {
            $isAssigned = $shipment->assignments()->whereHas('partner', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->exists();

            if (!$isAssigned && $shipment->status !== 'rfq') {
                return ApiResponse::error('FORBIDDEN', 'Access denied to this shipment', [], 403);
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
        ]);

        $shipment = $this->shipmentEngine->create($request->all(), $request->user());
        return ApiResponse::created($shipment);
    }

    public function update(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        
        // RBAC: Ops/Admin only
        if (!in_array($request->user()->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Only Ops/Admin can update shipment status', [], 403);
        }

        $request->validate(['status' => 'required|string']);
        $shipment = $this->shipmentEngine->updateStatus($shipment, $request->status);
        
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
        
        // RBAC: Ops/Admin only
        if (!in_array($request->user()->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Only Ops/Admin can assign partners', [], 403);
        }

        $request->validate(['partner_id' => 'required|exists:partners,id', 'leg_type' => 'required|string']);
        $assignment = $this->orchestrationEngine->assignPartner($shipment, $request->all());
        
        return ApiResponse::created($assignment);
    }

    protected function validateShipmentAccess(Shipment $shipment, \App\Models\User $user, bool $allowPartner = false)
    {
        if (in_array($user->role, ['ops', 'admin'])) {
            return true;
        }

        if ($user->role === 'customer') {
            return $shipment->customer_id === $user->id;
        }

        if ($user->role === 'partner' && $allowPartner) {
            // Check if assigned or if it's an RFQ
            $isAssigned = $shipment->assignments()->whereHas('partner', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->exists();

            return $isAssigned || $shipment->status === 'rfq';
        }

        return false;
    }

    public function getAssignments($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to these assignments', [], 403);
        }
        return ApiResponse::ok($shipment->assignments()->with('partner')->get());
    }

    public function getEvents($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to these events', [], 403);
        }
        $events = $this->trackingService->getEvents($shipment);
        return ApiResponse::ok(TrackingEventResource::collection($events));
    }

    public function addEvent(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        
        // RBAC: Partner assigned to this shipment or Ops/Admin
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to add events', [], 403);
        }

        $request->validate([
            'status_code' => 'required|string',
            'location' => 'nullable|string',
            'description' => 'required|string',
        ]);

        $event = $this->trackingService->addEvent($shipment, $request->all(), $request->user()->id);
        return ApiResponse::created(new TrackingEventResource($event));
    }

    public function getDocuments($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to these documents', [], 403);
        }
        return ApiResponse::ok($this->documentVault->list($shipment));
    }

    public function uploadDocument(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to upload documents', [], 403);
        }

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
        if (!$this->validateShipmentAccess($document->shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to download this document', [], 403);
        }
        return Storage::disk('public')->download($document->file_path);
    }

    public function getTickets($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to these tickets', [], 403);
        }
        return ApiResponse::ok($this->ticketsService->list($shipment));
    }

    public function createTicket(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to create tickets here', [], 403);
        }

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
        if (!$this->validateShipmentAccess($ticket->shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to comment on this ticket', [], 403);
        }

        $request->validate(['body' => 'required|string']);
        $comment = $this->ticketsService->addComment($ticket, $request->body, $request->user()->id);
        return ApiResponse::created($comment);
    }

    public function getInvoice($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        if (!$this->validateShipmentAccess($shipment, $request->user(), true)) {
            return ApiResponse::error('FORBIDDEN', 'Access denied to this invoice', [], 403);
        }
        return ApiResponse::ok($this->billingService->getInvoice($shipment));
    }

    public function generateInvoice(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        
        // RBAC: Ops/Admin only
        if (!in_array($request->user()->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Only Ops/Admin can generate invoices', [], 403);
        }

        $invoice = $this->billingService->generate($shipment, $request->user()->id);
        return ApiResponse::created($invoice);
    }

    public function getPartners()
    {
        return ApiResponse::ok(\App\Models\Partner::all());
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
