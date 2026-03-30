<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Support\ApiResponse;

class NotificationController extends ApiController
{
    /**
     * Get unread notifications for the user.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()->unreadNotifications;
        return ApiResponse::ok($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id, Request $request)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return ApiResponse::ok(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return ApiResponse::ok(['message' => 'All notifications marked as read']);
    }
}
