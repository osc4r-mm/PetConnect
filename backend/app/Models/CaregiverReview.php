<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo CaregiverReview: representa una valoración o reseña que un usuario deja a un cuidador,
 * indicando la puntuación otorgada por el usuario a ese cuidador.
 */
class CaregiverReview extends Model
{
    protected $table = 'reviews';
    public $timestamps = false;
    protected $fillable = ['reviewer_id', 'caregiver_id', 'rating'];

    /**
     * Relaciona la valoración con el usuario que la escribió (el que deja la reseña).
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Relaciona la valoración con el cuidador que la recibe.
     */
    public function caregiver()
    {
        return $this->belongsTo(Caregiver::class, 'caregiver_id')->withDefault();
    }
}