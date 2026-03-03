<?php

namespace Database\Factories;

use App\Models\Shipment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    public function definition(): array
    {
        $customer = User::factory()->create(['role' => 'customer']);
        return [
            'tracking_number' => 'SN-' . strtoupper($this->faker->bothify('??###')),
            'customer_id'     => $customer->id,
            'created_by'      => $customer->id,
            'origin'          => $this->faker->city() . ', ' . $this->faker->country(),
            'destination'     => $this->faker->city() . ', ' . $this->faker->country(),
            'status'          => $this->faker->randomElement(['pending', 'processing', 'transit', 'delivered']),
            'mode'            => $this->faker->randomElement(['sea', 'air', 'land']),
            'service_type'    => $this->faker->randomElement(['standard', 'express', 'economy']),
            'cargo_type'      => 'general',
            'total_weight'    => $this->faker->numberBetween(100, 5000),
            'weight_unit'     => 'kg',
            'customer_price'  => $this->faker->randomFloat(2, 500, 10000),
            'internal_value'  => $this->faker->randomFloat(2, 300, 8000),
            'description'     => $this->faker->sentence(),
        ];
    }
}
