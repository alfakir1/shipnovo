<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Success response (200 OK)
     */
    public static function ok($data = null, array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => $meta,
            'error' => null,
        ], 200);
    }

    /**
     * Created response (201 Created)
     */
    public static function created($data = null, array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => $meta,
            'error' => null,
        ], 201);
    }

    /**
     * Error response
     */
    public static function error(string $code, string $message, array $details = [], int $httpStatus = 400): JsonResponse
    {
        return response()->json([
            'data' => null,
            'meta' => null,
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details,
            ],
        ], $httpStatus);
    }
}
