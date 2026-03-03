<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Warehouse;
use App\Models\InventoryItem;
use App\Models\Partner;
use App\Models\User;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partner = Partner::first();
        $customer = User::where('role', 'customer')->first();

        if ($partner && $customer) {
            $warehouse = Warehouse::create([
                'partner_id' => $partner->id,
                'name' => 'Main Jeddah Logistics Center',
                'location' => 'Jeddah, KSA',
                'total_capacity' => 5000,
                'available_capacity' => 4850,
                'status' => 'active',
            ]);

            InventoryItem::create([
                'warehouse_id' => $warehouse->id,
                'customer_id' => $customer->id,
                'sku' => 'ELEC-001',
                'name' => 'High-End Headphones',
                'quantity' => 150,
                'weight_per_unit' => 0.5,
                'volume_per_unit' => 0.1,
            ]);

            InventoryItem::create([
                'warehouse_id' => $warehouse->id,
                'customer_id' => $customer->id,
                'sku' => 'ELEC-002',
                'name' => 'Smartphone Cases',
                'quantity' => 2000,
                'weight_per_unit' => 0.05,
                'volume_per_unit' => 0.01,
            ]);
        }
    }
}
