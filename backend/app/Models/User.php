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
        'image',
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
            $role = Role::where('name', 'user')->first();
            $user->roles()->attach($role);
        });
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
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
