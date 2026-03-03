<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'ShipNovo Admin',
            'email' => 'admin@shipnovo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Ops
        User::create([
            'name' => 'Ops Agent',
            'email' => 'ops@shipnovo.com',
            'password' => Hash::make('password'),
            'role' => 'ops',
        ]);

        // Customers
        User::create([
            'name' => 'Electronics Importer',
            'email' => 'customer@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'subscription_plan' => 'Basic',
        ]);

        // Partners (Users)
        User::create([
            'name' => 'Global Carrier Co.',
            'email' => 'carrier@globalcarrier.com',
            'password' => Hash::make('password'),
            'role' => 'partner',
        ]);

        User::create([
            'name' => 'FastCustoms Ltd.',
            'email' => 'customs@fastcustoms.com',
            'password' => Hash::make('password'),
            'role' => 'partner',
        ]);
    }
}
