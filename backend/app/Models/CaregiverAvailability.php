<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo CaregiverAvailability: representa los horarios de disponibilidad de un cuidador,
 * indicando qué días y en qué franjas horarias está disponible para ofrecer sus servicios.
 */
class CaregiverAvailability extends Model
{
    protected $table = 'caregiver_availability';
    public $timestamps = false;
    protected $fillable = ['caregiver_id', 'day_of_week', 'time_slot'];

    /**
     * Relaciona la disponibilidad con el cuidador correspondiente.
     */
    public function caregiver()
    {
        return $this->belongsTo(Caregiver::class);
    }
}