<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use App\Models\Shipment;
use Illuminate\Http\Request;
use App\Support\ApiResponse;

class InvoiceController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Invoice::with(['shipment' => fn($q) => $q->select('id', 'tracking_number', 'origin', 'destination', 'status')]);

        if ($user->role === 'customer') {
            $query->whereHas('shipment', function ($q) use ($user) {
                $q->where('customer_id', $user->id);
            });
        } elseif ($user->role === 'partner') {
            return ApiResponse::ok([]);
        }
        // Ops/Admin see all

        $invoices = $query->latest()->paginate(15);
        return ApiResponse::ok($invoices);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Only ops/admin can create invoices', [], 403);
        }

        $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'due_date' => 'nullable|date',
        ]);

        $shipment = Shipment::findOrFail($request->shipment_id);

        $invoiceNumber = 'INV-' . strtoupper(substr(md5(uniqid()), 0, 8));

        $invoice = Invoice::create([
            'shipment_id' => $shipment->id,
            'issued_by_user_id' => $user->id,
            'invoice_number' => $invoiceNumber,
            'amount' => $request->amount,
            'currency' => $request->currency ?? 'USD',
            'due_date' => $request->due_date,
            'status' => 'pending',
        ]);

        return ApiResponse::created($invoice->load('shipment'));
    }

    public function pay(Request $request, $id)
    {
        $user = $request->user();
        $invoice = Invoice::with('shipment')->findOrFail($id);

        // Customer can pay their own invoices; ops/admin can pay any
        if ($user->role === 'customer') {
            if ($invoice->shipment?->customer_id !== $user->id) {
                return ApiResponse::error('FORBIDDEN', 'You cannot pay this invoice', [], 403);
            }
        } elseif ($user->role === 'partner') {
            return ApiResponse::error('FORBIDDEN', 'Partners cannot pay invoices', [], 403);
        }

        if ($invoice->status === 'paid') {
            return ApiResponse::error('ALREADY_PAID', 'This invoice is already paid', [], 422);
        }

        // Use transaction to ensure both invoice and shipment are updated
        return \DB::transaction(function() use ($invoice, $user) {
            // Mark the invoice as paid
            $invoice->update(['status' => 'paid']);

            // Sync shipment status
            $shipment = $invoice->shipment;
            if ($shipment && ($shipment->status === 'offer_selected' || $shipment->status === 'rfq')) {
                try {
                    // Admin can force, others use state machine
                    if (in_array($user->role, ['admin', 'ops'])) {
                        $shipment->update(['status' => 'processing']);
                    } else {
                        \App\Services\Shipment\ShipmentStateMachine::transition($shipment, 'processing');
                    }
                } catch (\Exception $e) {
                    // If transition fails, we still allow payment but log or handle
                    \Log::warning("Status transition failed for shipment {$shipment->id} during payment: " . $e->getMessage());
                }
            }

            return ApiResponse::ok($invoice->fresh());
        });
    }
}
