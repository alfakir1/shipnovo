<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ShipmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\PartnerApprovalController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/config', [SystemController::class, 'config']);
Route::get('/public/track/{token}', [PublicController::class, 'track']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/kyc/upload', [AuthController::class, 'uploadKyc'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    // Shipments
    Route::apiResource('shipments', ShipmentController::class);
    Route::patch('/shipments/{id}', [ShipmentController::class, 'update']); // Explicit Patch for status

    // Quotes (New)
    Route::get('/shipments/quotes', [ShipmentController::class, 'quotes']);

    // Assignments
    Route::get('/shipments/{id}/assignments', [ShipmentController::class, 'getAssignments']);
    Route::post('/shipments/{id}/assignments', [ShipmentController::class, 'assignPartner']);

    // Tracking Events
    Route::get('/shipments/{id}/events', [ShipmentController::class, 'getEvents']);
    Route::post('/shipments/{id}/events', [ShipmentController::class, 'addEvent']);

    // Tickets (Legacy/Direct)
    Route::post('/shipments/{id}/tickets', [ShipmentController::class, 'createTicket']);

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

    // Ratings
    Route::get('/shipments/{id}/rating', [RatingController::class, 'show']);
    Route::post('/shipments/{id}/rating', [RatingController::class, 'store']);

    // Chat System (Replaces Old Tickets)
    Route::get('/shipments/{id}/chat', [\App\Http\Controllers\Api\TicketController::class, 'getChat']);
    Route::post('/shipments/{id}/chat', [\App\Http\Controllers\Api\TicketController::class, 'postChat']);
    Route::get('/tickets/{id}', [\App\Http\Controllers\Api\TicketController::class, 'show']);

    // Billing (P0/P1.5)
    Route::get('/shipments/{shipment}/invoice', [ShipmentController::class, 'getInvoice']);
    Route::post('/shipments/{shipment}/invoice', [ShipmentController::class, 'generateInvoice']);
    Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

    // Global Endpoints
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::post('/invoices/{id}/pay', [InvoiceController::class, 'pay']);
    Route::get('/pricing', [PricingController::class, 'index']);
    Route::post('/pricing', [PricingController::class, 'store']);
    Route::patch('/pricing/{id}', [PricingController::class, 'update']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/messages', [TicketController::class, 'postMessage']);
    Route::post('/tickets/{id}/comments', [TicketController::class, 'postComment']);

    // Warehouse Management (P1)
    Route::get('/warehouses', [\App\Http\Controllers\Api\WarehouseController::class, 'index']);
    Route::post('/warehouses', [\App\Http\Controllers\Api\WarehouseController::class, 'store']);
    Route::get('/warehouses/{id}/inventory', [\App\Http\Controllers\Api\WarehouseController::class, 'inventory']);
    Route::post('/warehouses/{id}/inventory', [\App\Http\Controllers\Api\WarehouseController::class, 'logInventory']);
    Route::delete('/warehouses/{id}/inventory/{itemId}', [\App\Http\Controllers\Api\WarehouseController::class, 'deleteInventoryItem']);
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

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Partners (Existing)
    Route::get('/partners', [ShipmentController::class, 'getPartners']);
});
