<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaregiverAvailability extends Model
{
    protected $table = 'caregiver_availability';
    public $timestamps = false;
    protected $fillable = ['caregiver_id', 'day_of_week', 'time_slot'];

    public function caregiver()
    {
        return $this->belongsTo(Caregiver::class);
    }
}