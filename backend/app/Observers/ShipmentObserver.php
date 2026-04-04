<?php

namespace App\Observers;

use App\Models\Shipment;
use App\Models\InventoryItem;
use Illuminate\Support\Facades\Log;

class ShipmentObserver
{
    /**
     * Handle the Shipment "updated" event.
     */
    public function updated(Shipment $shipment): void
    {
        // Automation Trigger: status becomes 'delivered', needs_storage is true, and warehouse_id is set
        if ($shipment->wasChanged('status') && 
            $shipment->status === 'delivered' && 
            $shipment->needs_storage && 
            $shipment->warehouse_id) 
        {
            $this->autoLogToWarehouse($shipment);
        }
    }

    /**
     * Automatically log shipment data to warehouse inventory.
     */
    protected function autoLogToWarehouse(Shipment $shipment): void
    {
        try {
            // Avoid duplicate logging for the same shipment ID if needed (though unlikely with wasChanged)
            $existing = InventoryItem::where('warehouse_id', $shipment->warehouse_id)
                ->where('sku', $shipment->tracking_number)
                ->exists();

            if ($existing) {
                Log::info("Automated inventory skipping: Shipment {$shipment->tracking_number} already logged.");
                return;
            }

            $quantity = (int)($shipment->pallet_count ?? 1);
            $volumePerUnit = $shipment->volume ? ($shipment->volume / $quantity) : 0;

            InventoryItem::create([
                'warehouse_id' => $shipment->warehouse_id,
                'customer_id' => $shipment->customer_id,
                'sku' => $shipment->tracking_number,
                'name' => "Inbound Cargo: " . ($shipment->description ?? $shipment->tracking_number),
                'quantity' => $quantity,
                'volume_per_unit' => $volumePerUnit,
            ]);

            Log::info("Automated inventory success: Shipment {$shipment->tracking_number} logged to Warehouse {$shipment->warehouse_id}.");
        } catch (\Exception $e) {
            Log::error("Automated inventory failed for shipment {$shipment->id}: " . $e->getMessage());
        }
    }
}
