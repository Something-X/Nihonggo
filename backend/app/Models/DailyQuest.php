<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyQuest extends Model
{
    protected $fillable = [
        'user_id', 'quest_type', 'description',
        'target_value', 'current_value', 'completed',
        'xp_reward', 'quest_date',
    ];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'quest_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
