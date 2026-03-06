<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where("email", "ops@shipnovo.com")->first();
if (!$user) {
    echo "Ops user not found\n";
    exit;
}

// Ensure user has a token
$user->tokens()->delete();
$token = $user->createToken("test-token")->plainTextToken;
echo "Token: " . $token . "\n";

$ch = curl_init("http://localhost:8000/api/shipments/8/assignments");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "partner_id" => 1,
    "leg_type" => "freight"
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Accept: application/json",
    "Authorization: Bearer " . $token
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpcode . "\n";
echo "Response body: " . $response . "\n";

