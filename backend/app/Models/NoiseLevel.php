<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo NoiseLevel: representa los diferentes niveles de ruido que pueden tener las mascotas en la aplicación,
 * permitiendo clasificar a las mascotas según su nivel de ruido.
 */
class NoiseLevel extends Model
{
    protected $table = 'noise_levels';
    public $timestamps = false;
    protected $fillable = ['name'];
}