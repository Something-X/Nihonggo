<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kanji extends Model
{
    protected $fillable = [
        'character', 'onyomi', 'kunyomi', 'meaning',
        'stroke_count', 'audio_url', 'image_url', 'difficulty',
    ];

    public function userProgress()
    {
        return $this->hasMany(UserKanjiProgress::class);
    }
}
