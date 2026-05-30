<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sentence;
use App\Models\UserKotobaProgress;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SentenceController extends Controller
{
    public function start(Request $request)
    {
        $request->validate([
            'count' => 'required|integer|min:3|max:20',
        ]);

        $user = $request->user();
        $user->update(['last_active_at' => Carbon::today()]);

        // Get sentences, preferring ones with kotoba the user is weak on
        $sentences = Sentence::inRandomOrder()
            ->limit($request->count)
            ->get();

        $questions = $sentences->map(function ($sentence) {
            $words = $sentence->words_json;
            $shuffled = $words;
            shuffle($shuffled);

            return [
                'id' => $sentence->id,
                'meaning' => $sentence->meaning,
                'correct_order' => $words,
                'shuffled_words' => $shuffled,
                'difficulty' => $sentence->difficulty,
            ];
        });

        return response()->json([
            'total' => count($questions),
            'questions' => $questions->values(),
        ]);
    }

    public function answer(Request $request)
    {
        $request->validate([
            'sentence_id' => 'required|integer|exists:sentences,id',
            'answer' => 'required|array',
        ]);

        $sentence = Sentence::findOrFail($request->sentence_id);
        $isCorrect = $request->answer === $sentence->words_json;

        return response()->json([
            'is_correct' => $isCorrect,
            'correct_answer' => $sentence->words_json,
            'japanese' => $sentence->japanese,
        ]);
    }
}
