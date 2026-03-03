<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    protected function ok($data = null, array $meta = []): JsonResponse
    {
        return ApiResponse::ok($data, $meta);
    }

    protected function created($data = null, array $meta = []): JsonResponse
    {
        return ApiResponse::created($data, $meta);
    }

    protected function error(string $code, string $message, array $details = [], int $httpStatus = 400): JsonResponse
    {
        return ApiResponse::error($code, $message, $details, $httpStatus);
    }
}
