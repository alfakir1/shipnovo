<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\PartnerApprovalController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\SystemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/config', [SystemController::class, 'config']);
Route::get('/public/track/{token}', [PublicController::class, 'track']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    // Shipments
    Route::apiResource('shipments', ShipmentController::class);
    Route::patch('/shipments/{id}', [ShipmentController::class, 'update']); // Explicit Patch for status

    // Quotes (New)
    Route::post('/shipments/quotes', [ShipmentController::class, 'quotes']);

    // Assignments
    Route::get('/shipments/{id}/assignments', [ShipmentController::class, 'getAssignments']);
    Route::post('/shipments/{id}/assignments', [ShipmentController::class, 'assignPartner']);

    // Tracking Events
    Route::get('/shipments/{id}/events', [ShipmentController::class, 'getEvents']);
    Route::post('/shipments/{id}/events', [ShipmentController::class, 'addEvent']);

    // Documents
    Route::get('/shipments/{id}/documents', [ShipmentController::class, 'getDocuments']);
    Route::post('/shipments/{id}/documents', [ShipmentController::class, 'uploadDocument']);
    Route::get('/documents/{id}/download', [ShipmentController::class, 'downloadDocument']);

    // Payments
    Route::post('/shipments/{id}/payments/authorize', [PaymentController::class, 'authorizePayment']);
    Route::post('/shipments/{id}/payments/capture', [PaymentController::class, 'capturePayment']);
    Route::post('/shipments/{id}/payments/refund', [PaymentController::class, 'refundPayment']);

    // Quotes
    Route::get('/shipments/{id}/quotes', [QuoteController::class, 'index']);
    Route::post('/shipments/{id}/quotes', [QuoteController::class, 'store']);
    Route::post('/shipments/{id}/quotes/{quoteId}/select', [QuoteController::class, 'select']);

    // Partner Approvals
    Route::get('/partners/pending', [PartnerApprovalController::class, 'pending']);
    Route::patch('/partners/{id}/approve', [PartnerApprovalController::class, 'approve']);
    Route::patch('/partners/{id}/reject', [PartnerApprovalController::class, 'reject']);

    // Returns
    Route::get('/shipments/{id}/returns', [ReturnController::class, 'index']);
    Route::post('/shipments/{id}/returns', [ReturnController::class, 'store']);
    Route::patch('/returns/{id}', [ReturnController::class, 'update']);

    // Tickets (Existing)
    Route::get('/shipments/{id}/tickets', [ShipmentController::class, 'getTickets']);
    Route::post('/shipments/{id}/tickets', [ShipmentController::class, 'createTicket']);
    Route::patch('/tickets/{id}', [ShipmentController::class, 'updateTicket']);
    Route::post('/tickets/{id}/comments', [ShipmentController::class, 'addTicketComment']);

    // Billing (P0/P1.5)
    Route::get('/shipments/{id}/invoice', [ShipmentController::class, 'getInvoice']);
    Route::post('/shipments/{id}/invoice', [ShipmentController::class, 'generateInvoice']);
    Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

    // Warehouse Management (P1)
    Route::get('/warehouses', [\App\Http\Controllers\Api\WarehouseController::class, 'index']);
    Route::post('/warehouses', [\App\Http\Controllers\Api\WarehouseController::class, 'store']);
    Route::get('/warehouses/{id}/inventory', [\App\Http\Controllers\Api\WarehouseController::class, 'inventory']);
    Route::post('/warehouses/storage-request', [\App\Http\Controllers\Api\WarehouseController::class, 'requestStorage']);
    // ... other warehouse routes

    // Analytics (P1.5)
    Route::get('/analytics/ops', [\App\Http\Controllers\Api\AnalyticsController::class, 'opsStats']);
    Route::get('/analytics/customer', [\App\Http\Controllers\Api\AnalyticsController::class, 'customerStats']);
    Route::get('/analytics/partner', [\App\Http\Controllers\Api\AnalyticsController::class, 'partnerStats']);

    // Fleet Management (P2)
    Route::get('/fleets', [\App\Http\Controllers\Api\FleetController::class, 'index']);
    Route::post('/fleets', [\App\Http\Controllers\Api\FleetController::class, 'store']);
    Route::get('/fleets/{id}/vehicles', [\App\Http\Controllers\Api\FleetController::class, 'vehicles']);
    Route::post('/fleets/{id}/vehicles', [\App\Http\Controllers\Api\FleetController::class, 'addVehicle']);
    Route::get('/drivers', [\App\Http\Controllers\Api\FleetController::class, 'drivers']);

    // Audit Logs
    Route::get('/audit-logs', [ShipmentController::class, 'getAuditLogs']);

    // Partners (Existing)
    Route::get('/partners', [ShipmentController::class, 'getPartners']);
});
