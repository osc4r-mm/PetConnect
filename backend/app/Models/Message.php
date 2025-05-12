<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';
    public $timestamps = false;
    protected $fillable = ['chat_id', 'sender_id', 'content', 'read_flag'];

    protected $casts = [
        'read_flag' => 'boolean',
        'sent_at' => 'datetime',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}