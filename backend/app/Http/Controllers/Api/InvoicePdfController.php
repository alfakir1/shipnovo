<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoicePdfController extends ApiController
{
    public function download(Request $request, $id)
    {
        $invoice = Invoice::with([
            'shipment.customer',
            'shipment',
            'issuedBy',
        ])->findOrFail($id);

        $user = $request->user();

        // RBAC: customer can only download their own invoice
        if ($user->role === 'customer') {
            if ($invoice->shipment?->customer_id !== $user->id) {
                return response()->json(['error' => 'FORBIDDEN', 'message' => 'Access denied'], 403);
            }
        } elseif ($user->role === 'partner') {
            return response()->json(['error' => 'FORBIDDEN', 'message' => 'Partners cannot access invoices'], 403);
        }
        // Admin/Ops can access all

        $data = [
            'invoice'  => $invoice,
            'shipment' => $invoice->shipment,
            'customer' => $invoice->shipment?->customer,
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data)
            ->setPaper('a4', 'portrait');

        $filename = 'invoice-' . ($invoice->invoice_number ?? $id) . '.pdf';

        return $pdf->download($filename);
    }

    public function stream(Request $request, $id)
    {
        $invoice = Invoice::with([
            'shipment.customer',
            'shipment',
            'issuedBy',
        ])->findOrFail($id);

        $user = $request->user();

        if ($user->role === 'customer') {
            if ($invoice->shipment?->customer_id !== $user->id) {
                return response()->json(['error' => 'FORBIDDEN', 'message' => 'Access denied'], 403);
            }
        } elseif ($user->role === 'partner') {
            return response()->json(['error' => 'FORBIDDEN', 'message' => 'Partners cannot access invoices'], 403);
        }

        $data = [
            'invoice'  => $invoice,
            'shipment' => $invoice->shipment,
            'customer' => $invoice->shipment?->customer,
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data)
            ->setPaper('a4', 'portrait');

        return $pdf->stream('invoice-' . ($invoice->invoice_number ?? $id) . '.pdf');
    }
}
