<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo PetPhoto: representa las fotos adicionales asociadas a una mascota,
 * almacenando la ruta de la imagen y la fecha de subida.
 */
class PetPhoto extends Model
{
    protected $table = 'pet_photos';
    public $timestamps = false;
    protected $fillable = ['pet_id', 'image_path', 'uploaded_at'];

    protected $dates = ['uploaded_at'];

    /**
     * Relaciona la foto con la mascota a la que pertenece.
     */
    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}