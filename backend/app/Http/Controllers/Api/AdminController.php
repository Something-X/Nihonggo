<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Kotoba, Kanji, Sentence, User, UserKotobaProgress, UserKanjiProgress, GameHistory};
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // --- Kotoba CRUD ---
    public function kotobaIndex() { return response()->json(Kotoba::paginate(20)); }
    public function kotobaStore(Request $r) {
        $r->validate(['japanese'=>'required','meaning'=>'required','difficulty'=>'required|in:N5,N4,N3,N2,N1']);
        return response()->json(Kotoba::create($r->all()), 201);
    }
    public function kotobaUpdate(Request $r, Kotoba $kotoba) {
        $kotoba->update($r->all()); return response()->json($kotoba);
    }
    public function kotobaDestroy(Kotoba $kotoba) {
        $kotoba->delete(); return response()->json(['message'=>'Deleted']);
    }

    // --- Kanji CRUD ---
    public function kanjiIndex() { return response()->json(Kanji::paginate(20)); }
    public function kanjiStore(Request $r) {
        $r->validate(['character'=>'required','meaning'=>'required','difficulty'=>'required|in:N5,N4,N3,N2,N1']);
        return response()->json(Kanji::create($r->all()), 201);
    }
    public function kanjiUpdate(Request $r, Kanji $kanji) {
        $kanji->update($r->all()); return response()->json($kanji);
    }
    public function kanjiDestroy(Kanji $kanji) {
        $kanji->delete(); return response()->json(['message'=>'Deleted']);
    }

    // --- Sentence CRUD ---
    public function sentenceIndex() { return response()->json(Sentence::paginate(20)); }
    public function sentenceStore(Request $r) {
        $r->validate(['japanese'=>'required','meaning'=>'required','words_json'=>'required|array']);
        return response()->json(Sentence::create($r->all()), 201);
    }
    public function sentenceUpdate(Request $r, Sentence $sentence) {
        $sentence->update($r->all()); return response()->json($sentence);
    }
    public function sentenceDestroy(Sentence $sentence) {
        $sentence->delete(); return response()->json(['message'=>'Deleted']);
    }

    // --- User Management ---
    public function userIndex() {
        return response()->json(User::withCount('gameHistories')->paginate(20));
    }
    public function userUpdate(Request $r, User $user) {
        $user->update($r->only(['name','role','is_banned','xp','level']));
        return response()->json($user);
    }
    public function userResetProgress(User $user) {
        UserKotobaProgress::where('user_id', $user->id)->delete();
        UserKanjiProgress::where('user_id', $user->id)->delete();
        GameHistory::where('user_id', $user->id)->delete();
        $user->update(['xp'=>0,'level'=>1,'total_correct'=>0,'total_wrong'=>0]);
        return response()->json(['message'=>'Progress reset']);
    }
    public function userDestroy(User $user) {
        $user->delete(); return response()->json(['message'=>'Deleted']);
    }

    // --- Stats ---
    public function stats() {
        return response()->json([
            'total_users' => User::count(),
            'active_today' => User::whereDate('last_active_at', today())->count(),
            'total_kotoba' => Kotoba::count(),
            'total_kanji' => Kanji::count(),
            'total_games' => GameHistory::count(),
        ]);
    }
}
