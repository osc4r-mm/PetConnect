<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    protected $table = 'requests';
    public $timestamps = false;
    protected $fillable = ['id', 'pet_id', 'sender_id', 'receiver_id', 'type', 'message', 'status', 'agreement_data', 'created_at', 'updated_at'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class, 'pet_id');
    }
}