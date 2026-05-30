<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'role',
        'xp', 'level', 'total_correct', 'total_wrong',
        'is_banned', 'last_active_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_banned' => 'boolean',
            'last_active_at' => 'date',
        ];
    }

    public function kotobaProgress()
    {
        return $this->hasMany(UserKotobaProgress::class);
    }

    public function kanjiProgress()
    {
        return $this->hasMany(UserKanjiProgress::class);
    }

    public function gameHistories()
    {
        return $this->hasMany(GameHistory::class);
    }

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('unlocked_at');
    }

    public function streak()
    {
        return $this->hasOne(Streak::class);
    }

    public function dailyQuests()
    {
        return $this->hasMany(DailyQuest::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
