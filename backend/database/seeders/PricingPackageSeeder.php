<?php

namespace Database\Seeders;

use App\Models\PricingPackage;
use Illuminate\Database\Seeder;

class PricingPackageSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing system packages to avoid duplicates
        PricingPackage::where('type', 'system')->delete();

        $origins = ['China', 'Germany', 'USA', 'India'];
        $destination = 'Yemen';

        $tiers = [
            ['name' => 'Economy', 'min' => 50, 'max' => 100, 'price' => 500],
            ['name' => 'Standard', 'min' => 100, 'max' => 500, 'price' => 1000],
            ['name' => 'Freight', 'min' => 500, 'max' => 1000, 'price' => 1500],
        ];

        foreach ($origins as $origin) {
            foreach ($tiers as $tier) {
                PricingPackage::create([
                    'name' => "{$tier['name']} - {$origin} to {$destination}",
                    'origin' => $origin,
                    'destination' => $destination,
                    'min_weight' => $tier['min'],
                    'max_weight' => $tier['max'],
                    'price' => $tier['price'],
                    'currency' => 'USD',
                    'type' => 'system',
                    'is_active' => true,
                ]);
            }
        }
    }
}
