<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ShipmentController;

$user = User::where('role', 'customer')->first();
if (!$user) {
    die("No customer found\n");
}

$controller = app(ShipmentController::class);

// Create a mock request
$request = Request::create('/api/shipments', 'POST', [
    'origin' => 'Test Origin',
    'destination' => 'Test Destination',
    'total_weight' => 100,
    'cargo_type' => 'general'
]);
$request->setUserResolver(function () use ($user) {
    return $user;
});

try {
    $response = $controller->store($request);
    $data = json_decode($response->getContent(), true);
    echo "Created Shipment ID: " . ($data['data']['id'] ?? 'null') . "\n";
    $id = $data['data']['id'];

    // Now try to fetch it
    $req2 = Request::create("/api/shipments/{$id}", 'GET');
    $req2->setUserResolver(function () use ($user) {
        return $user;
    });

    $res2 = $controller->show($id, $req2);
    echo "Show Response: \n" . $res2->getContent() . "\n";

} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
