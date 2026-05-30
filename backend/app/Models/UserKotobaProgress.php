<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserKotobaProgress extends Model
{
    protected $table = 'user_kotoba_progress';

    protected $fillable = [
        'user_id', 'kotoba_id', 'point',
        'times_correct', 'times_wrong',
        'last_reviewed_at', 'next_review_at',
    ];

    protected function casts(): array
    {
        return [
            'last_reviewed_at' => 'datetime',
            'next_review_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kotoba()
    {
        return $this->belongsTo(Kotoba::class);
    }

    public function getHafalanPercentage(): float
    {
        return ($this->point / 100) * 100;
    }
}
