<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserKotobaProgress;
use App\Models\UserKanjiProgress;
use App\Models\GameHistory;
use App\Models\Kotoba;
use App\Models\Kanji;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $streak = $user->streak;

        $kotobaProgress = UserKotobaProgress::where('user_id', $user->id)->get();
        $kanjiProgress = UserKanjiProgress::where('user_id', $user->id)->get();

        $totalKotoba = Kotoba::count();
        $totalKanji = Kanji::count();

        $kotobaLearned = $kotobaProgress->where('point', '>', 0)->count();
        $kanjiLearned = $kanjiProgress->where('point', '>', 0)->count();
        $kotobaMastered = $kotobaProgress->where('point', 100)->count();
        $kanjiMastered = $kanjiProgress->where('point', 100)->count();

        $avgKotobaPoint = $kotobaProgress->count() > 0 ? $kotobaProgress->avg('point') : 0;
        $avgKanjiPoint = $kanjiProgress->count() > 0 ? $kanjiProgress->avg('point') : 0;

        $overallPercentage = 0;
        $totalItems = $totalKotoba + $totalKanji;
        if ($totalItems > 0) {
            $totalPoints = $kotobaProgress->sum('point') + $kanjiProgress->sum('point');
            $maxPoints = $totalItems * 100;
            $overallPercentage = round(($totalPoints / $maxPoints) * 100, 1);
        }

        $accuracy = ($user->total_correct + $user->total_wrong) > 0
            ? round(($user->total_correct / ($user->total_correct + $user->total_wrong)) * 100, 1)
            : 0;

        return response()->json([
            'user' => [
                'name' => $user->name,
                'xp' => $user->xp,
                'level' => $user->level,
                'total_correct' => $user->total_correct,
                'total_wrong' => $user->total_wrong,
                'accuracy' => $accuracy,
            ],
            'streak' => [
                'current' => $streak->current_streak ?? 0,
                'longest' => $streak->longest_streak ?? 0,
            ],
            'kotoba' => [
                'total' => $totalKotoba,
                'learned' => $kotobaLearned,
                'mastered' => $kotobaMastered,
                'avg_point' => round($avgKotobaPoint, 1),
            ],
            'kanji' => [
                'total' => $totalKanji,
                'learned' => $kanjiLearned,
                'mastered' => $kanjiMastered,
                'avg_point' => round($avgKanjiPoint, 1),
            ],
            'overall_percentage' => $overallPercentage,
            'games_played' => GameHistory::where('user_id', $user->id)->count(),
        ]);
    }

    public function progressChart(Request $request)
    {
        $user = $request->user();
        $days = $request->get('days', 14);

        $data = GameHistory::where('user_id', $user->id)
            ->where('played_at', '>=', Carbon::now()->subDays($days))
            ->selectRaw('DATE(played_at) as date, SUM(correct_answers) as correct, SUM(wrong_answers) as wrong, SUM(xp_earned) as xp')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function accuracyChart(Request $request)
    {
        $user = $request->user();

        $data = GameHistory::where('user_id', $user->id)
            ->where('played_at', '>=', Carbon::now()->subDays(14))
            ->selectRaw('DATE(played_at) as date, ROUND(AVG(correct_answers / GREATEST(total_questions, 1) * 100), 1) as accuracy')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function leaderboard()
    {
        $users = \App\Models\User::where('role', 'user')
            ->where('is_banned', false)
            ->orderByDesc('xp')
            ->limit(20)
            ->select('id', 'name', 'avatar', 'xp', 'level', 'total_correct')
            ->get();

        return response()->json($users);
    }

    public function libraryChapters(Request $request)
    {
        $userId = $request->user()->id;

        // Get all progress for this user
        $progressMap = UserKotobaProgress::where('user_id', $userId)
            ->pluck('point', 'kotoba_id')
            ->toArray();

        $chapters = Kotoba::selectRaw("category, COUNT(*) as word_count, MIN(difficulty) as difficulty")
            ->groupBy('category')
            ->orderByRaw("CAST(SUBSTRING_INDEX(category, '_', -1) AS UNSIGNED) ASC")
            ->get()
            ->map(function ($c) use ($progressMap) {
                $num = (int) str_replace('minna_bab_', '', $c->category);

                // Get all kotoba IDs in this chapter
                $kotobaIds = Kotoba::where('category', $c->category)->pluck('id');
                $totalPoints = 0;
                $learnedCount = 0;
                $masteredCount = 0;

                foreach ($kotobaIds as $kid) {
                    $point = $progressMap[$kid] ?? 0;
                    $totalPoints += $point;
                    if ($point > 0) $learnedCount++;
                    if ($point >= 100) $masteredCount++;
                }

                $maxPoints = $c->word_count * 100;
                $percentage = $maxPoints > 0 ? round(($totalPoints / $maxPoints) * 100, 1) : 0;

                return [
                    'id' => $c->category,
                    'number' => $num,
                    'label' => "Bab $num",
                    'word_count' => $c->word_count,
                    'difficulty' => $c->difficulty,
                    'learned' => $learnedCount,
                    'mastered' => $masteredCount,
                    'percentage' => $percentage,
                ];
            });

        return response()->json($chapters);
    }

    public function libraryWords(Request $request)
    {
        $userId = $request->user()->id;
        $query = Kotoba::query();

        if ($request->has('chapter') && $request->chapter) {
            $query->where('category', $request->chapter);
        }

        if ($request->has('search') && $request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('japanese', 'LIKE', "%$s%")
                  ->orWhere('romaji', 'LIKE', "%$s%")
                  ->orWhere('meaning', 'LIKE', "%$s%");
            });
        }

        $words = $query->orderBy('id')->get();

        // Attach user progress to each word
        $progressMap = UserKotobaProgress::where('user_id', $userId)
            ->whereIn('kotoba_id', $words->pluck('id'))
            ->get()
            ->keyBy('kotoba_id');

        $result = $words->map(function ($w) use ($progressMap) {
            $progress = $progressMap->get($w->id);
            $w->point = $progress ? $progress->point : 0;
            $w->times_correct = $progress ? $progress->times_correct : 0;
            $w->times_wrong = $progress ? $progress->times_wrong : 0;
            $w->percentage = $w->point; // point is already 0-100
            return $w;
        });

        return response()->json($result);
    }
}

