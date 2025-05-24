<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Request: representa las solicitudes enviadas entre usuarios relacionadas con mascotas,
 * como solicitudes de adopción, cuidado o cualquier otra interacción, incluyendo mensajes y acuerdos asociados.
 */
class Request extends Model
{
    protected $table = 'requests';
    public $timestamps = false;
    protected $fillable = [
        'id', 'pet_id', 'sender_id', 'receiver_id', 'type', 'message', 'status', 'agreement_data', 'created_at', 'updated_at'
    ];

    protected $casts = [
        'agreement_data' => 'array',
    ];
    
    /**
     * Relaciona la solicitud con el usuario que la envía.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Relaciona la solicitud con el usuario que la recibe.
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Relaciona la solicitud con la mascota involucrada.
     */
    public function pet()
    {
        return $this->belongsTo(Pet::class, 'pet_id');
    }
}