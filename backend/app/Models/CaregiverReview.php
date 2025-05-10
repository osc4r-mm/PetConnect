<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaregiverReview extends Model
{
    public $timestamps = false;
    protected $fillable=['reviewer_id','caregiver_id','rating'];
    public function reviewer(){return $this->belongsTo(User::class,'reviewer_id');}
    public function caregiver(){return $this->belongsTo(Caregiver::class);}    
}