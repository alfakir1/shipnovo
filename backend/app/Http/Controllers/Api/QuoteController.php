<?php

namespace App\Http\Controllers\Api;

use App\Models\Shipment;
use App\Models\Quote;
use App\Models\Partner;
use App\Services\Quote\QuoteService;
use App\Services\Billing\BillingService;
use App\Services\Shipment\ShipmentStateMachine;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class QuoteController extends ApiController
{
    protected $quoteService;
    protected $billingService;

    public function __construct(QuoteService $quoteService, BillingService $billingService)
    {
        $this->quoteService = $quoteService;
        $this->billingService = $billingService;
    }

    public function index($shipmentId, Request $request)
    {
        $shipment = Shipment::findOrFail($shipmentId);
        
        $this->authorize('view', $shipment);

        $query = $shipment->quotes()->with('partner');
        if ($request->user()->role === 'partner') {
            $partner = Partner::where('user_id', $request->user()->id)->firstOrFail();
            $query->where('partner_id', $partner->id);
        }

        return ApiResponse::ok($query->get());
    }

    public function store($shipmentId, Request $request)
    {
        $shipment = Shipment::findOrFail($shipmentId);
        
        $this->authorize('submitQuote', $shipment);

        $request->validate([
            'amount' => 'required|numeric',
            'eta_days' => 'required|integer',
            'notes' => 'nullable|string',
        ]);

        $partner = Partner::where('user_id', $request->user()->id)->firstOrFail();
        
        $quote = $this->quoteService->submitQuote($shipment, $partner, $request->all());

        // If it's the first quote, transition to offers_received
        if ($shipment->status === 'rfq' || $shipment->status === 'pending') {
             ShipmentStateMachine::transition($shipment, ShipmentStateMachine::STATUS_OFFERS_RECEIVED);
        }

        return ApiResponse::created($quote);
    }

    public function select($shipmentId, $quoteId, Request $request)
    {
        $shipment = Shipment::findOrFail($shipmentId);
        $quote = Quote::findOrFail($quoteId);

        // P0-3: Integrity Check
        if ($quote->shipment_id !== $shipment->id) {
            return ApiResponse::error('INVALID_QUOTE', 'This quote does not belong to the specified shipment', [], 422);
        }

        // P0-3: State validation
        $allowedStatuses = [
            ShipmentStateMachine::STATUS_RFQ, 
            ShipmentStateMachine::STATUS_OFFERS_RECEIVED
        ];
        if (!in_array($shipment->status, $allowedStatuses)) {
             return ApiResponse::error('INVALID_STATE', 'Selection is only allowed in RFQ or Offers Received states', [], 422);
        }

        $this->authorize('selectQuote', $shipment);

        $quote = $this->quoteService->selectQuote($quote);
        
        // IMPORTANT: Refresh shipment to get updated prices from selectQuote
        $shipment->refresh();

        // Generate Invoice (P0.5)
        $this->billingService->generate($shipment, $request->user()->id);

        // Update shipment status via state machine
        ShipmentStateMachine::transition($shipment, ShipmentStateMachine::STATUS_OFFER_SELECTED);

        return ApiResponse::ok($quote);
    }
}
