<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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

    protected static function booted()
    {
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

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole($roleName)
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isCaregiver()
    {
        return $this->hasRole('caregiver');
    }

    public function caregiver()
    {
        return $this->hasOne(Caregiver::class);
    }

    public function sentRequests()
    {
        return $this->hasMany(Request::class, 'sender_id');
    }

    public function receivedRequests()
    {
        return $this->hasMany(Request::class, 'receiver_id');
    }

    public function paymentsAsOwner()
    {
        return $this->hasMany(Payment::class, 'owner_id');
    }

    public function debtsOwed()
    {
        return $this->hasMany(Debt::class, 'owner_id');
    }

    public function reviewsWritten()
    {
        return $this->hasMany(CaregiverReview::class, 'reviewer_id');
    }

    public function chatsAsUser1()
    {
        return $this->hasMany(Chat::class, 'user1_id');
    }

    public function chatsAsUser2()
    {
        return $this->hasMany(Chat::class, 'user2_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function chats()
    {
        return $this->chatsAsUser1()->union($this->chatsAsUser2());
    }
}