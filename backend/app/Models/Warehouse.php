<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['partner_id', 'name', 'location', 'total_capacity', 'available_capacity', 'status'];
    protected $appends = ['used_capacity'];

    public function getUsedCapacityAttribute()
    {
        return $this->total_capacity - $this->available_capacity;
    }


    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function storageContracts()
    {
        return $this->hasMany(StorageContract::class);
    }
}
