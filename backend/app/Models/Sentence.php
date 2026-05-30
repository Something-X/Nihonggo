<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sentence extends Model
{
    protected $fillable = [
        'japanese', 'romaji', 'meaning', 'words_json', 'difficulty',
    ];

    protected function casts(): array
    {
        return [
            'words_json' => 'array',
        ];
    }

    public function kotobas()
    {
        return $this->belongsToMany(Kotoba::class, 'sentence_kotobas');
    }
}
