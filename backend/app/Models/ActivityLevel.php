<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo ActivityLevel: representa los diferentes niveles de actividad que pueden tener las mascotas en la aplicación,
 * permitiendo clasificar a las mascotas según su nivel de energía o actividad.
 */
class ActivityLevel extends Model
{
    protected $table = 'activity_levels';
    public $timestamps = false;
    protected $fillable = ['name'];
}