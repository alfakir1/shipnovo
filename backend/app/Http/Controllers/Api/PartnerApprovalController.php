<?php

namespace App\Http\Controllers\Api;

use App\Models\Partner;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class PartnerApprovalController extends ApiController
{
    public function pending()
    {
        // RBAC: Admin/Ops only
        if (!in_array(auth()->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $partners = Partner::where('is_verified', false)->with('user')->get();
        return ApiResponse::ok($partners);
    }

    public function approve($id, Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $partner = Partner::findOrFail($id);
        $partner->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verification_notes' => $request->notes,
        ]);

        return ApiResponse::ok($partner);
    }

    public function reject($id, Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'ops'])) {
            return ApiResponse::error('FORBIDDEN', 'Access denied', [], 403);
        }

        $partner = Partner::findOrFail($id);
        $partner->update([
            'is_verified' => false,
            'verification_notes' => $request->notes ?? 'Rejected by Admin',
        ]);

        return ApiResponse::ok($partner);
    }
}
