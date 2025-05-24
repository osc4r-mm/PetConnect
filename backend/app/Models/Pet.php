<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo Pet: representa a las mascotas registradas por los usuarios en la aplicación,
 * incluyendo sus características, estado de adopción/cuidado y relaciones con otros modelos descriptivos.
 */
class Pet extends Model
{
    use HasFactory;

    protected $table = 'pets';
    public $timestamps = false;

    protected $fillable = [
        'name', 'age', 'gender_id', 'weight', 'description', 'profile_path',
        'for_adoption', 'for_sitting', 'species_id', 'breed_id',
        'size_id', 'activity_level_id', 'noise_level_id', 'registered_at', 'user_id'
    ];

    protected $casts = [
        'for_adoption' => 'boolean',
        'for_sitting' => 'boolean',
        'registered_at' => 'datetime',
    ];

    /**
     * Relaciona la mascota con el usuario dueño de la misma.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relaciona la mascota con su género.
     */
    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    /**
     * Relaciona la mascota con su especie.
     */
    public function species()
    {
        return $this->belongsTo(Species::class);
    }

    /**
     * Relaciona la mascota con su raza.
     */
    public function breed()
    {
        return $this->belongsTo(Breed::class);
    }

    /**
     * Relaciona la mascota con su tamaño.
     */
    public function size()
    {
        return $this->belongsTo(Size::class);
    }

    /**
     * Relaciona la mascota con su nivel de actividad.
     */
    public function activityLevel()
    {
        return $this->belongsTo(ActivityLevel::class);
    }

    /**
     * Relaciona la mascota con su nivel de ruido.
     */
    public function noiseLevel()
    {
        return $this->belongsTo(NoiseLevel::class);
    }

    /**
     * Relaciona la mascota con sus fotos adicionales.
     */
    public function photos()
    {
        return $this->hasMany(PetPhoto::class);
    }
}