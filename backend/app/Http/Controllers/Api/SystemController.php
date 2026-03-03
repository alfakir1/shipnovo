<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    public function config(): JsonResponse
    {
        return response()->json([
            'data' => [
                'delay_alert_min_events' => config('shipnovo.delay_alert_min_events', 3),
            ]
        ]);
    }
}
