<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Role: representa los diferentes roles que puede tener un usuario en la aplicación
 * (por ejemplo: user, admin, caregiver).
 */
class Role extends Model
{
    protected $table = 'roles';
    protected $fillable = ['name'];

    /**
     * Relaciona el rol con todos los usuarios que tienen este rol.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}