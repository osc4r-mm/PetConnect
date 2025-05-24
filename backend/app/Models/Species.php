<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Species: representa los diferentes tipos de especies de mascotas registradas en la aplicación,
 * como perros, gatos, etc., y sus relaciones con las razas correspondientes.
 */
class Species extends Model
{
    protected $table = 'species';
    public $timestamps = false;
    protected $fillable = ['name'];

    /**
     * Relaciona la especie con todas las razas asociadas a ella.
     */
    public function breeds()
    {
        return $this->hasMany(Breed::class);
    }
}