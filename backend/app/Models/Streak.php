<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Streak extends Model
{
    protected $fillable = [
        'user_id', 'current_streak', 'longest_streak', 'last_streak_date',
    ];

    protected function casts(): array
    {
        return ['last_streak_date' => 'date'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
