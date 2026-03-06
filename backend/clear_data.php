<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

Schema::disableForeignKeyConstraints();

// Fetch all table names based on DB connection (SQLite in this case)
if (DB::connection()->getDriverName() === 'sqlite') {
    $tables = collect(DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))->pluck('name')->toArray();
} else {
    $tables = collect(DB::select('SHOW TABLES'))->map(function ($table) {
        return array_values((array)$table)[0];
    })->toArray();
}

// Tables to keep
$keep = [
    'users',
    'partners', // Keep partner profiles linked to users
    'migrations',
    'personal_access_tokens',
    'password_reset_tokens',
    'failed_jobs',
    'cache',
    'cache_locks',
    'jobs',
    'job_batches'
];

foreach ($tables as $table) {
    if (!in_array($table, $keep)) {
        echo "Clearing table: {$table}\n";
        DB::table($table)->delete();
    }
}

Schema::enableForeignKeyConstraints();
echo "All transaction data cleared successfully!\n";
