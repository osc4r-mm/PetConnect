<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    protected $table = 'requests';
    public $timestamps = false;
    protected $fillable = ['sender_id', 'receiver_id', 'type', 'message'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function pets()
    {
        return $this->belongsToMany(Pet::class, 'request_pets');
    }
}