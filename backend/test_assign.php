<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where("role", "ops")->first();
$shipment = \App\Models\Shipment::find(8);
$partner = \App\Models\Partner::first();

if (!$user) { echo "Ops user not found\n"; exit; }
if (!$shipment) { echo "Shipment 8 not found\n"; exit; }
if (!$partner) { echo "No partner found\n"; exit; }

try {
    $engine = app(\App\Services\Orchestration\OrchestrationEngine::class);
    $result = $engine->assignPartner($shipment, [
        "partner_id" => $partner->id,
        "leg_type" => "freight"
    ], $user);
    echo "Success:\n";
    print_r($result);
} catch (\Exception $e) {
    echo "Error:\n" . $e->getMessage() . "\n" . $e->getTraceAsString();
}
