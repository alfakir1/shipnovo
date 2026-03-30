<?php

namespace App\Services\Document;

use App\Models\Shipment;
use App\Models\Document;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentVault
{
    /**
     * Upload and store a document
     */
    public function upload(Shipment $shipment, UploadedFile $file, string $type, $userId)
    {
        $path = $file->store("shipments/{$shipment->id}/documents", 'public');

        $document = Document::create([
            'shipment_id' => $shipment->id,
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'doc_type' => $type,
            'uploaded_by' => $userId,
        ]);

        $adminsAndOps = \App\Models\User::whereIn('role', ['admin', 'ops'])->get();
        \Illuminate\Support\Facades\Notification::send($adminsAndOps, new \App\Notifications\SystemNotification(
            'New Document Uploaded',
            "A {$type} document was uploaded for shipment {$shipment->tracking_number}.",
            'system_operation',
            ['shipment_id' => $shipment->id]
        ));

        return $document;
    }

    /**
     * List documents for a shipment
     */
    public function list(Shipment $shipment)
    {
        return $shipment->documents()->latest()->get();
    }
}
