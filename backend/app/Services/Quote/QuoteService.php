<?php

namespace App\Services\Quote;

use App\Models\Quote;
use App\Models\Shipment;
use App\Models\Partner;
use Illuminate\Support\Facades\DB;

class QuoteService
{
    public function submitQuote(Shipment $shipment, Partner $partner, array $data)
    {
        return Quote::create([
            'shipment_id' => $shipment->id,
            'partner_id' => $partner->id,
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'USD',
            'eta_days' => $data['eta_days'],
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
        ]);
    }

    public function selectQuote(Quote $quote)
    {
        return DB::transaction(function () use ($quote) {
            // Reject other quotes for this shipment
            Quote::where('shipment_id', $quote->shipment_id)
                ->where('id', '!=', $quote->id)
                ->update(['status' => 'rejected']);

            $quote->update(['status' => 'accepted']);

            return $quote;
        });
    }
}
