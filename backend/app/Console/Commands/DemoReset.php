<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DemoReset extends Command
{
    /**
     * Artisan command signature.
     * Run as: php artisan demo:reset
     */
    protected $signature = 'demo:reset
        {--seed-only : Skip migrate:fresh and only re-seed}
        {--force : Force the operation in production}';

    protected $description = 'Reset the database and seed with a complete Shipper Journey demo environment.';

    public function handle(): int
    {
        if (app()->isProduction() && ! $this->option('force')) {
            $this->error('⛔ Refusing to wipe production DB without --force flag.');
            return 1;
        }

        $this->components->info('🚀 ShipNovo Demo Reset');

        if (! $this->option('seed-only')) {
            $this->components->task('Running migrate:fresh', function () {
                $this->callSilent('migrate:fresh');
            });
        }

        $this->components->task('Seeding demo data', function () {
            $this->callSilent('db:seed', ['--class' => 'DemoSeeder']);
        });

        $this->newLine();
        $this->components->success('Demo environment is ready!');
        $this->line('');
        $this->line('  <fg=yellow>Demo Accounts</> (all use password: <fg=green>password</>)');
        $this->table(
            ['Role', 'Email'],
            [
                ['Admin',    'admin@shipnovo.com'],
                ['Ops',      'ops@shipnovo.com'],
                ['Customer', 'customer@example.com'],
                ['Partner (Carrier)',  'carrier@globalcarrier.com'],
                ['Partner (Customs)', 'customs@fastcustoms.com'],
            ]
        );

        $this->newLine();
        $this->line('  <fg=yellow>Demo Shipments</>');
        $this->table(
            ['Tracking #', 'Status', 'Public Tracking Link'],
            [
                ['SN-DEMO-RFQ',       'rfq',           'http://localhost:3000/track/tk_demo_rfq'],
                ['SN-DEMO-PAY',       'processing',    'http://localhost:3000/track/tk_demo_pay'],
                ['SN-DEMO-TRANSIT',   'transit',       'http://localhost:3000/track/tk_demo_transit'],
                ['SN-DEMO-DELIVERED', 'at_destination','http://localhost:3000/track/tk_demo_delivered'],
            ]
        );

        $this->newLine();
        $this->line('  <fg=cyan>Full E2E Demo Steps:</>');
        $this->line('  1. Login as <fg=green>customer@example.com</> → See KYC Alert & Dashboard KPIs');
        $this->line('  2. Create a new Shipment → Observe new <fg=green>Pickup Date</> field & quote comparison');
        $this->line('  3. Open <fg=green>SN-DEMO-PAY</> → Click "Pay $3,500" to authorize payment');
        $this->line('  4. Open <fg=green>SN-DEMO-TRANSIT</> → Check Tracking tab → See Simulated Map + Delay Alert');
        $this->line('  5. Open <fg=green>SN-DEMO-DELIVERED</> → Click "Confirm Receipt" → See Payment Release + Rating ⭐');
        $this->line('  6. Return to Dashboard → Verify avg_delivery_time / best_carrier KPIs');
        $this->line('  7. Guest Tracking → Open any <fg=green>Public Tracking Link</> above to see guest experience');
        $this->line('  8. Login as <fg=green>ops@shipnovo.com</> → Assign partner to SN-DEMO-RFQ in Orchestration');
        $this->line('  9. Login as <fg=green>carrier@globalcarrier.com</> → Submit Quote on SN-DEMO-RFQ');

        return 0;
    }
}
