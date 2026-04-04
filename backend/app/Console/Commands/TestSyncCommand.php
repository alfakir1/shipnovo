<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Shipment;
use App\Models\InventoryItem;

class TestSyncCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test automated shipment inventory sync';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Creating shipment...");
        $s = new Shipment();
        $s->origin = 'China';
        $s->destination = 'SA';
        $s->mode = 'sea';
        $s->customer_id = 3;
        $s->created_by = 3;
        $s->status = 'transit';
        $s->needs_storage = true;
        $s->warehouse_id = 1;
        $s->volume = 10;
        $s->pallet_count = 2;
        $s->description = 'Auto-sync Test';
        $s->save();
        $this->info("Created: #" . $s->id . " TN: " . $s->tracking_number);

        $this->info("Updating status to delivered...");
        $s->update(['status' => 'delivered']);

        $inv = InventoryItem::where('warehouse_id', 1)->where('sku', $s->tracking_number)->first();
        if ($inv) {
            $this->info("SUCCESS: Inventory auto-created! ID=" . $inv->id . " SKU=" . $inv->sku . " Name=" . $inv->name);
        } else {
            $this->error("FAIL: No inventory item created.");
        }
    }
}
