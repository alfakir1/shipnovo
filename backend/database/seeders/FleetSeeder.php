<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FleetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partner = \App\Models\Partner::first();
        if (!$partner) return;

        $fleet = \App\Models\Fleet::updateOrCreate(
            ['name' => 'Main Logistics Fleet', 'partner_id' => $partner->id],
            ['description' => 'Primary fleet for regional deliveries', 'status' => 'active']
        );

        $vehicles = [
            [
                'make' => 'Mercedes-Benz',
                'model' => 'Actros',
                'year' => 2022,
                'plate_number' => 'LGC-101',
                'type' => 'Heavy Truck',
                'capacity_weight' => 25000,
                'capacity_volume' => 80,
                'status' => 'available',
            ],
            [
                'make' => 'Toyota',
                'model' => 'Hilux',
                'year' => 2023,
                'plate_number' => 'LGC-202',
                'type' => 'Pickup',
                'capacity_weight' => 1000,
                'capacity_volume' => 5,
                'status' => 'in_transit',
            ],
            [
                'make' => 'Ford',
                'model' => 'Transit',
                'year' => 2021,
                'plate_number' => 'LGC-303',
                'type' => 'Van',
                'capacity_weight' => 3500,
                'capacity_volume' => 12,
                'status' => 'available',
            ]
        ];

        foreach ($vehicles as $vehicleData) {
            $fleet->vehicles()->updateOrCreate(
                ['plate_number' => $vehicleData['plate_number']],
                $vehicleData
            );
        }
    }
}
