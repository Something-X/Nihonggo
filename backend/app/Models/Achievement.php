<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'name', 'description', 'icon',
        'condition_type', 'condition_value', 'xp_reward',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('unlocked_at');
    }
}
