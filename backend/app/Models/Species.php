<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Species extends Model
{
    protected $table = 'species';
    public $timestamps = false;
    protected $fillable = ['name'];

    public function breeds()
    {
        return $this->hasMany(Breed::class);
    }
}