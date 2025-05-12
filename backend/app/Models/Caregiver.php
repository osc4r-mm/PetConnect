<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Caregiver extends Model
{
    protected $table = 'caregivers';
    public $timestamps = false;
    protected $fillable = ['user_id', 'active', 'hourly_rate'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availability()
    {
        return $this->hasMany(CaregiverAvailability::class);
    }

    public function reviews()
    {
        return $this->hasMany(CaregiverReview::class, 'caregiver_id');
    }

    public function debts()
    {
        return $this->hasMany(Debt::class, 'caregiver_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'caregiver_id');
    }
}