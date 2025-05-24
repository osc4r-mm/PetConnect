<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo User: representa a los usuarios de la aplicación, incluyendo sus datos personales,
 * su rol, sus mascotas, solicitudes y valoraciones.
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'users';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'email',
        'password',
        'wallet_balance',
        'latitude',
        'longitude',
        'image',
        'role_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'wallet_balance' => 'decimal:2',
    ];

    /**
     * Evento boot para asignar automáticamente el rol "user" al crear un usuario si no se especifica.
     */
    protected static function booted() {
        static::created(function ($user) {
            // Si no se asignó un rol, asignar por defecto el rol de usuario
            if (!$user->role_id) {
                $role = Role::where('name', 'user')->first();
                if ($role) {
                    $user->role_id = $role->id;
                    $user->save();
                }
            }
        });
    }

    /**
     * Relaciona al usuario con las mascotas que tiene.
     */
    public function pets() {
        return $this->hasMany(Pet::class, 'user_id');
    }

    /**
     * Relaciona al usuario con su rol (user, admin, caregiver, etc).
     */
    public function role() {
        return $this->belongsTo(Role::class);
    }

    /**
     * Devuelve true si el usuario tiene el rol especificado.
     */
    public function hasRole($roleName) {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Devuelve true si el usuario es administrador.
     */
    public function isAdmin() {
        return $this->hasRole('admin');
    }

    /**
     * Devuelve true si el usuario es cuidador.
     */
    public function isCaregiver() {
        return $this->hasRole('caregiver');
    }

    /**
     * Relaciona al usuario con el registro de cuidador (si es cuidador).
     */
    public function caregiver() {
        return $this->hasOne(Caregiver::class);
    }

    /**
     * Devuelve true si el usuario es cuidador y está activo.
     */
    public function isCaregiverActive() {
        return $this->isCaregiver() && $this->caregiver && $this->caregiver->active;
    }

    /**
     * Relaciona al usuario con las solicitudes que ha enviado.
     */
    public function sentRequests() {
        return $this->hasMany(Request::class, 'sender_id');
    }

    /**
     * Relaciona al usuario con las solicitudes que ha recibido.
     */
    public function receivedRequests() {
        return $this->hasMany(Request::class, 'receiver_id');
    }

    /**
     * Relaciona al usuario con las valoraciones que ha escrito a cuidadores.
     */
    public function reviewsWritten() {
        return $this->hasMany(CaregiverReview::class, 'reviewer_id');
    }
    
    /**
     * Une todos los chats en los que participa el usuario.
     */
    public function chats() {
        return $this->chatsAsUser1()->union($this->chatsAsUser2());
    }
}