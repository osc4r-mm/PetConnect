<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Size: representa los diferentes tamaños que pueden tener las mascotas en la aplicación,
 * permitiendo clasificar a las mascotas según su tamaño.
 */
class Size extends Model
{
    protected $table = 'sizes';
    public $timestamps = false;
    protected $fillable = ['name'];
}