<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Partner;
use Illuminate\Database\Seeder;

class PartnerSeeder extends Seeder
{
    public function run(): void
    {
        $partners = [
            [
                'email' => 'carrier@globalcarrier.com',
                'company_name' => 'Global Carrier Co.',
                'role_type' => 'carrier',
            ],
            [
                'email' => 'customs@fastcustoms.com',
                'company_name' => 'FastCustoms Ltd.',
                'role_type' => 'customs',
            ],
        ];

        foreach ($partners as $partnerData) {
            $user = User::where('email', $partnerData['email'])->first();
            if ($user) {
                Partner::create([
                    'user_id' => $user->id,
                    'company_name' => $partnerData['company_name'],
                    'role_type' => $partnerData['role_type'],
                    'contact_email' => $partnerData['email'],
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);
            }
        }
    }
}
