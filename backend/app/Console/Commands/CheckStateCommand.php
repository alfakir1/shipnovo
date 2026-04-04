<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Shipment;
use App\Models\InventoryItem;
use App\Models\StorageContract;

class CheckStateCommand extends Command
{
    protected $signature = 'check:state';
    protected $description = 'Check recent database state';

    public function handle()
    {
        $s = Shipment::latest()->first();
        if ($s) {
            $this->info("Latest Shipment: ID={$s->id}, Status={$s->status}, Needs Storage=" . ($s->needs_storage ? 'Yes' : 'No') . ", Warehouse ID={$s->warehouse_id}, TN={$s->tracking_number}");
        }

        $invCount = InventoryItem::count();
        $this->info("Total Inventory Items: {$invCount}");
        $inv = InventoryItem::latest()->first();
        if ($inv) {
            $this->info("Latest Inventory: ID={$inv->id}, SKU={$inv->sku}, Name={$inv->name}, Qty={$inv->quantity}");
        }

        $cCount = StorageContract::count();
        $cActive = StorageContract::where('status', 'active')->count();
        $this->info("Storage Contracts: {$cCount} total, {$cActive} active");
    }
}
