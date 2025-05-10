<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    public $timestamps = false;
    protected $fillable=['owner_id','caregiver_id','amount_due'];
    public function owner(){return $this->belongsTo(User::class,'owner_id');}
    public function caregiver(){return $this->belongsTo(Caregiver::class);}    
}