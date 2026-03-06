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

        return Document::create([
            'shipment_id' => $shipment->id,
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'doc_type' => $type,
            'uploaded_by' => $userId,
        ]);
    }

    /**
     * List documents for a shipment
     */
    public function list(Shipment $shipment)
    {
        return $shipment->documents()->latest()->get();
    }
}
