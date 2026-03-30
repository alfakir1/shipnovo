<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Support\ApiResponse;

class AuthController extends ApiController
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return ApiResponse::error('UNAUTHORIZED', 'Invalid login credentials', [], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::ok([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:customer,partner,ops',
            'company_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role ?? 'customer',
            'company_name' => $request->company_name,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::created([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], ['message' => 'Account created successfully']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::ok(null, ['message' => 'Logged out successfully']);
    }

    public function uploadKyc(Request $request)
    {
        $user = $request->user();
        $user->kyc_status = 'completed';
        $user->save();

        return ApiResponse::ok($user, ['message' => 'KYC documents uploaded successfully']);
    }

    public function me(Request $request)
    {
        return ApiResponse::ok($request->user());
    }
}
