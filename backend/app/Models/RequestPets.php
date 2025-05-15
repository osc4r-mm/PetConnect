<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestPets extends Model
{
    protected $table = 'request_pets';
    public $timestamps = false;
    protected $fillable = ['request_id', 'pet_id'];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}