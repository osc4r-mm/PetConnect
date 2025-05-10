<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Animal extends Model
{
    protected $fillable=[
      'name','age','gender_id','weight','description','profile_path',
      'for_adoption','available_for_sitting','species_id','breed_id',
      'size_id','activity_level_id','noise_level_id'
    ];

    public function gender(){return $this->belongsTo(Gender::class);}    
    public function species(){return $this->belongsTo(Species::class);}    
    public function breed(){return $this->belongsTo(Breed::class);}    
    public function size(){return $this->belongsTo(AnimalSize::class);}    
    public function activityLevel(){return $this->belongsTo(ActivityLevel::class);}    
    public function noiseLevel(){return $this->belongsTo(NoiseLevel::class);}    
    public function photos(){return $this->hasMany(AnimalPhoto::class);}    
}