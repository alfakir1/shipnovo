<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Shipment;
use App\Models\Quote;
use App\Models\Payment;
use App\Models\Partner;
use App\Models\Warehouse;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function opsStats(Request $request)
    {
        $this->authorizeOps($request);

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        $stats = [
            'overview' => [
                'total_shipments' => Shipment::count(),
                'active_shipments' => Shipment::whereNotIn('status', ['delivered', 'cancelled'])->count(),
                'monthly_revenue' => Payment::where('status', 'captured')
                    ->where('created_at', '>=', $startOfMonth)
                    ->sum('amount'),
                'pending_rfqs' => Shipment::where('status', 'rfq')->count(),
            ],
            'trends' => $this->getMonthlyTrends(),
            'performance' => [
                'avg_quote_time_hrs' => 2.5, // Mocked for now
                'on_time_delivery_rate' => 94.2,
            ]
        ];

        return ApiResponse::ok($stats);
    }

    public function customerStats(Request $request)
    {
        $user = $request->user();
        $startOfMonth = Carbon::now()->startOfMonth();

        $stats = [
            'spend_mtd' => Payment::whereHas('shipment', function($q) use ($user) {
                $q->where('customer_id', $user->id);
            })->where('status', 'captured')
              ->where('created_at', '>=', $startOfMonth)
              ->sum('amount'),
            'active_shipments' => Shipment::where('customer_id', $user->id)
                ->whereNotIn('status', ['delivered', 'cancelled'])
                ->count(),
            'total_volume_stored' => DB::table('inventory_items')
                ->where('customer_id', $user->id)
                ->select(DB::raw('SUM(quantity * volume_per_unit) as total'))
                ->first()->total ?? 0,
            'shipment_status_distribution' => Shipment::where('customer_id', $user->id)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'avg_delivery_time_days' => 4.2, // Mocked for demo
            'best_carrier' => 'Global Freight Solutions' // Mocked for demo
        ];

        return ApiResponse::ok($stats);
    }

    public function partnerStats(Request $request)
    {
        $user = $request->user();
        $partner = Partner::where('user_id', $user->id)->first();
        
        if (!$partner) return ApiResponse::error('NOT_FOUND', 'Partner record not found', [], 404);

        $stats = [
            'total_earnings' => Quote::where('partner_id', $partner->id)
                ->where('status', 'accepted')
                ->sum('amount'),
            'active_jobs' => Shipment::whereHas('quotes', function($q) use ($partner) {
                $q->where('partner_id', $partner->id)->where('status', 'accepted');
            })->whereNotIn('status', ['delivered', 'cancelled'])->count(),
            'warehouse_utilization' => Warehouse::where('partner_id', $partner->id)
                ->select(DB::raw('SUM(total_capacity - available_capacity) as used, SUM(total_capacity) as total'))
                ->first(),
            'quote_win_rate' => 0.65 // Mocked
        ];

        return ApiResponse::ok($stats);
    }

    private function getMonthlyTrends()
    {
        // Last 6 months trend
        return collect(range(0, 5))->map(function($i) {
            $date = Carbon::now()->subMonths($i);
            return [
                'month' => $date->format('M'),
                'shipments' => Shipment::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'revenue' => Payment::where('status', 'captured')
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->sum('amount'),
            ];
        })->reverse()->values();
    }

    private function authorizeOps(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'ops'])) {
            abort(403, 'Unauthorized');
        }
    }
}
