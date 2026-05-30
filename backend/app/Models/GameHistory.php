<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameHistory extends Model
{
    protected $fillable = [
        'user_id', 'mode', 'total_questions', 'correct_answers',
        'wrong_answers', 'xp_earned', 'max_combo', 'burn_mode',
        'time_seconds', 'details', 'played_at',
    ];

    protected function casts(): array
    {
        return [
            'burn_mode' => 'boolean',
            'details' => 'array',
            'played_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
