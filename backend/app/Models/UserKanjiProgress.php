<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserKanjiProgress extends Model
{
    protected $table = 'user_kanji_progress';

    protected $fillable = [
        'user_id', 'kanji_id', 'point',
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

    public function kanji()
    {
        return $this->belongsTo(Kanji::class);
    }
}
