<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'wallet_balance',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'wallet_balance' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::created(function($user) {
            $role = Role::where('name','user')->first();
            $user->roles()->attach($role);
        });
    }

    /**
     * Roles assigned to the user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    /**
     * If the user is a caregiver, this returns the caregiver profile.
     */
    public function caregiver()
    {
        return $this->hasOne(Caregiver::class);
    }

    /**
     * Requests sent by this user (as owner).
     */
    public function sentRequests()
    {
        return $this->hasMany(Request::class, 'sender_id');
    }

    /**
     * Requests received by this user (as caregiver or shelter).
     */
    public function receivedRequests()
    {
        return $this->hasMany(Request::class, 'receiver_id');
    }

    /**
     * Payments made by this user (as owner paying caregivers).
     */
    public function paymentsAsOwner()
    {
        return $this->hasMany(Payment::class, 'owner_id');
    }

    /**
     * Debts owed by this user (as owner).
     */
    public function debtsOwed()
    {
        return $this->hasMany(Debt::class, 'owner_id');
    }

    /**
     * Reviews this user has written (as owner reviewing caregivers).
     */
    public function reviewsWritten()
    {
        return $this->hasMany(CaregiverReview::class, 'reviewer_id');
    }

    /**
     * All chats involving this user (as user1).
     */
    public function chatsAsUser1()
    {
        return $this->hasMany(Chat::class, 'user1_id');
    }

    /**
     * All chats involving this user (as user2).
     */
    public function chatsAsUser2()
    {
        return $this->hasMany(Chat::class, 'user2_id');
    }

    /**
     * Messages sent by this user.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Combine both chat relations.
     */
    public function chats()
    {
        return $this->chatsAsUser1()->union($this->chatsAsUser2());
    }
}