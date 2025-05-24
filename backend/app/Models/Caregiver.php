<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Caregiver: representa a los usuarios que ofrecen servicios de cuidado de mascotas,
 * así como su tarifa, disponibilidad, valoraciones, deudas y pagos asociados.
 */
class Caregiver extends Model
{
    protected $table = 'caregivers';
    public $timestamps = false;
    protected $fillable = ['user_id', 'hourly_rate'];

    /**
     * Relaciona al cuidador con el usuario al que pertenece.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relaciona al cuidador con sus horarios de disponibilidad.
     */
    public function availability()
    {
        return $this->hasMany(CaregiverAvailability::class);
    }

    /**
     * Relaciona al cuidador con las valoraciones que ha recibido.
     */
    public function reviews()
    {
        return $this->hasMany(CaregiverReview::class, 'caregiver_id');
    }
}