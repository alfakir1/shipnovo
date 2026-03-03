<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'role_type',
        'contact_email',
        'contact_phone',
        'is_verified',
        'verified_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }
}
