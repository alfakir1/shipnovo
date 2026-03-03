<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrackingEventResource extends JsonResource
{
    /**
     * Transform the resource into an array with Spec V2 mapping.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shipment_id' => $this->shipment_id,
            'status_update' => $this->status_code, // Mapping
            'location_name' => $this->location,    // Mapping
            'description' => $this->description,
            'timestamp' => $this->occurred_at,      // Mapping
            'author' => [
                'name' => $this->creator?->name,
                'role' => $this->creator?->role,
            ],
        ];
    }
}
