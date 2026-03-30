<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Support\ApiResponse;

class DocumentController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Document::with('shipment');

        // RBAC logic for global documents
        if ($user->role === 'customer') {
            $query->where(function($q) use ($user) {
                $q->whereHas('shipment', function ($sub) use ($user) {
                    $sub->where('customer_id', $user->id);
                })->orWhere('uploaded_by', $user->id);
            });
        } elseif ($user->role === 'partner') {
            $query->where(function($q) use ($user) {
                // Documents linked to shipments the partner is assigned to
                $q->whereHas('shipment.assignments.partner', function ($sub) use ($user) {
                    $sub->where('user_id', $user->id);
                })
                // OR Documents uploaded by the partner themselves (Personal)
                ->orWhere('uploaded_by', $user->id);
            });
        }
        // Ops/Admin can view all

        $documents = $query->latest()->paginate(15);
        return ApiResponse::ok($documents);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipment_id' => 'nullable|exists:shipments,id',
            'file' => 'required|file|max:10240', // 10MB limit
            'doc_type' => 'required|string',
            'name' => 'nullable|string'
        ]);

        $user = $request->user();
        $shipment = $request->shipment_id ? Shipment::findOrFail($request->shipment_id) : null;

        // RBAC logic for uploading documents
        if ($user->role === 'customer') {
            if ($shipment && $shipment->customer_id !== $user->id) {
                return ApiResponse::error('FORBIDDEN', 'You cannot upload documents to this shipment', [], 403);
            }
        } elseif ($user->role === 'partner') {
            if ($shipment) {
                $isAssigned = $shipment->assignments()->whereHas('partner', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->exists();

                if (!$isAssigned) {
                    return ApiResponse::error('FORBIDDEN', 'You are not assigned to this shipment', [], 403);
                }
            }
        } elseif (!in_array($user->role, ['ops', 'admin'])) {
            return ApiResponse::error('FORBIDDEN', 'Unauthorized role', [], 403);
        }

        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'shipment_id' => $shipment?->id,
            'name' => $request->name ?? $request->file('file')->getClientOriginalName(),
            'file_path' => $path,
            'doc_type' => $request->doc_type,
            'uploaded_by' => $user->id,
        ]);

        return ApiResponse::created($document);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return ApiResponse::error('FORBIDDEN', 'Only admins can delete documents', [], 403);
        }

        $document = Document::findOrFail($id);
        
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();

        return ApiResponse::ok(null, 'Document deleted successfully');
    }
}
