<?php
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

$s = \App\Models\Shipment::latest()->first();
print_r($s ? $s->toArray() : 'no shipment');
echo "\n====\n";
$inv = \App\Models\InventoryItem::latest()->first();
print_r($inv ? $inv->toArray() : 'no inv');
echo "\n====\n";
$c = \App\Models\StorageContract::latest()->first();
print_r($c ? $c->toArray() : 'no contract');
echo "\n";
