<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    public $timestamps = false;
    protected $fillable = ['owner_id', 'caregiver_id', 'amount'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function caregiver()
    {
        return $this->belongsTo(Caregiver::class);
    }
}