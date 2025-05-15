<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PetPhoto extends Model
{
    protected $table = 'pet_photos';
    public $timestamps = false;
    protected $fillable = ['pet_id', 'image_path', 'uploaded_at'];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}