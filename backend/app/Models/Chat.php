<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable=['user1_id','user2_id'];
    public function messages(){return $this->hasMany(Message::class);}
}