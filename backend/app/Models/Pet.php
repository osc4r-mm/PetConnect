<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pet extends Model
{
    use HasFactory;

    protected $table = 'pets';
    public $timestamps = false;

    protected $fillable = [
        'name', 'age', 'gender_id', 'weight', 'description', 'profile_path',
        'for_adoption', 'for_sitting', 'species_id', 'breed_id',
        'size_id', 'activity_level_id', 'noise_level_id', 'registered_at'
    ];

    protected $casts = [
        'for_adoption' => 'boolean',
        'for_sitting' => 'boolean',
        'registered_at' => 'datetime',
    ];

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function species()
    {
        return $this->belongsTo(Species::class);
    }

    public function breed()
    {
        return $this->belongsTo(Breed::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }

    public function activityLevel()
    {
        return $this->belongsTo(ActivityLevel::class);
    }

    public function noiseLevel()
    {
        return $this->belongsTo(NoiseLevel::class);
    }

    public function photos()
    {
        return $this->hasMany(PetPhoto::class);
    }
}
