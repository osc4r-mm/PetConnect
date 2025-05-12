<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLevel extends Model
{
    protected $table = 'activity_levels';
    public $timestamps = false;
    protected $fillable = ['name'];
}