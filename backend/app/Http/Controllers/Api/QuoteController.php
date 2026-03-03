<?php

namespace App\Http\Controllers\Api;

use App\Models\Shipment;
use App\Models\Quote;
use App\Models\Partner;
use App\Services\Quote\QuoteService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class QuoteController extends ApiController
{
    protected $quoteService;

    public function __construct(QuoteService $quoteService)
    {
        $this->quoteService = $quoteService;
    }

    public function index($shipmentId, Request $request)
    {
        $shipment = Shipment::findOrFail($shipmentId);
        
        // RBAC: Customer only sees for own shipment, Partner only sees own quote
        $user = $request->user();
        if ($user->role === 'customer' && $shipment->customer_id !== $user->id) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $query = $shipment->quotes()->with('partner');
        if ($user->role === 'partner') {
            $partner = Partner::where('user_id', $user->id)->firstOrFail();
            $query->where('partner_id', $partner->id);
        }

        return ApiResponse::ok($query->get());
    }

    public function store($shipmentId, Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'eta_days' => 'required|integer',
            'notes' => 'nullable|string',
        ]);

        $shipment = Shipment::findOrFail($shipmentId);
        $user = $request->user();

        if ($user->role !== 'partner') {
            return ApiResponse::error('FORBIDDEN', 'Only partners can submit quotes', [], 403);
        }

        $partner = Partner::where('user_id', $user->id)->firstOrFail();
        
        if (!$partner->is_verified) {
             return ApiResponse::error('FORBIDDEN', 'Partner is not verified yet', [], 403);
        }

        $quote = $this->quoteService->submitQuote($shipment, $partner, $request->all());
        return ApiResponse::created($quote);
    }

    public function select($shipmentId, $quoteId, Request $request)
    {
        $shipment = Shipment::findOrFail($shipmentId);
        $quote = Quote::findOrFail($quoteId);

        if ($request->user()->id !== $shipment->customer_id && $request->user()->role !== 'admin') {
            return ApiResponse::error('FORBIDDEN', 'Only the shipment owner can select a quote', [], 403);
        }

        $quote = $this->quoteService->selectQuote($quote);
        
        // Update shipment status
        $shipment->update(['status' => 'processing']);

        return ApiResponse::ok($quote);
    }
}
