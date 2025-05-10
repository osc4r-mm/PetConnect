<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduledWalk extends Model
{
    protected $fillable=['request_id','caregiver_id','animal_id','day_of_week','time_slot'];
    public function request(){return $this->belongsTo(Request::class);}
    public function caregiver(){return $this->belongsTo(Caregiver::class);}
    public function animal(){return $this->belongsTo(Animal::class);}    
}