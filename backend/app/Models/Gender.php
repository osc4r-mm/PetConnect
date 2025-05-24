<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Gender: representa los diferentes géneros que pueden tener las mascotas en la aplicación,
 * permitiendo clasificar a las mascotas según su género.
 */
class Gender extends Model
{
    protected $table = 'genders';
    public $timestamps = false;
    protected $fillable = ['name'];
}