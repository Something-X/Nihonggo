<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kotoba extends Model
{
    protected $fillable = [
        'japanese', 'romaji', 'meaning', 'example_sentence',
        'audio_url', 'image_url', 'difficulty', 'category',
    ];

    public function userProgress()
    {
        return $this->hasMany(UserKotobaProgress::class);
    }

    public function sentences()
    {
        return $this->belongsToMany(Sentence::class, 'sentence_kotobas');
    }
}
