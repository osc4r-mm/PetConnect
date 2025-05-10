<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Breed extends Model
{
    protected $fillable=['species_id','name'];
    public function species(){return $this->belongsTo(Species::class);}
}
