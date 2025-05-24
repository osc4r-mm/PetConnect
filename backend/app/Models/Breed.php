<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Breed: representa las diferentes razas asociadas a una especie de mascota en la aplicación,
 * permitiendo identificar la raza específica a la que pertenece una mascota.
 */
class Breed extends Model
{
    protected $table = 'breeds';
    public $timestamps = false;
    protected $fillable = ['species_id', 'name'];

    /**
     * Relaciona la raza con la especie a la que pertenece.
     */
    public function species()
    {
        return $this->belongsTo(Species::class);
    }
}