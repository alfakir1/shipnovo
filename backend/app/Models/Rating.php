<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'shipment_id',
        'rater_id',
        'partner_id',
        'score',
        'comment',
        'suggestions',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
