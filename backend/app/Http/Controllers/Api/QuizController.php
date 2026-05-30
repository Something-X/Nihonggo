<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdaptiveEngine;
use App\Models\GameHistory;
use App\Models\DailyQuest;
use App\Models\Achievement;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class QuizController extends Controller
{
    protected AdaptiveEngine $engine;

    public function __construct(AdaptiveEngine $engine)
    {
        $this->engine = $engine;
    }

    /**
     * Start a quiz session — returns all questions at once
     */
    public function start(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:kotoba,kanji,mixed',
            'count' => 'required|integer|min:5|max:100',
            'timer' => 'nullable|integer|in:0,30,60,180',
            'burn_mode' => 'boolean',
            'endless' => 'boolean',
            'max_errors' => 'nullable|integer|in:2,3,5',
        ]);

        $user = $request->user();
        $user->update(['last_active_at' => Carbon::today()]);

        $selected = $this->engine->getAdaptiveQuestions(
            $user->id,
            $request->mode,
            $request->count
        );

        $questions = [];
        foreach ($selected as $item) {
            $questions[] = $this->engine->generateQuestion($item);
        }

        return response()->json([
            'session' => [
                'mode' => $request->mode,
                'total_questions' => count($questions),
                'timer' => $request->timer ?? 0,
                'burn_mode' => $request->burn_mode ?? false,
                'endless' => $request->endless ?? false,
                'max_errors' => $request->max_errors ?? 3,
            ],
            'questions' => $questions,
        ]);
    }

    /**
     * Submit answer for a single question
     */
    public function answer(Request $request)
    {
        $request->validate([
            'item_id' => 'required|integer',
            'type' => 'required|in:kotoba,kanji',
            'answer' => 'required|string',
            'correct_answer' => 'required|string',
        ]);

        $user = $request->user();

        // Support multiple correct answers separated by "/"
        // e.g. "Mahal/Tinggi" → answering "Tinggi" or "Mahal" are both correct
        $answer = mb_strtolower(trim($request->answer));
        $alternatives = array_map(fn($alt) => mb_strtolower(trim($alt)), explode('/', $request->correct_answer));
        $isCorrect = in_array($answer, $alternatives);

        $result = $this->engine->processAnswer(
            $user->id,
            $request->item_id,
            $request->type,
            $isCorrect
        );

        // Update user stats
        if ($isCorrect) {
            $user->increment('total_correct');
        } else {
            $user->increment('total_wrong');
        }

        // Update daily quests
        if ($isCorrect) {
            DailyQuest::where('user_id', $user->id)
                ->where('quest_date', Carbon::today())
                ->where('quest_type', 'answer_correct')
                ->where('completed', false)
                ->increment('current_value');

            // Check and mark completed
            DailyQuest::where('user_id', $user->id)
                ->where('quest_date', Carbon::today())
                ->whereRaw('current_value >= target_value')
                ->where('completed', false)
                ->update(['completed' => true]);
        }

        return response()->json($result);
    }

    /**
     * Finish quiz session
     */
    public function finish(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:kotoba,kanji,mixed,sentence',
            'total_questions' => 'required|integer',
            'correct_answers' => 'required|integer',
            'wrong_answers' => 'required|integer',
            'max_combo' => 'required|integer',
            'burn_mode' => 'boolean',
            'time_seconds' => 'nullable|integer',
        ]);

        $user = $request->user();

        // Calculate XP
        $baseXp = $request->correct_answers * 10;
        $comboBonus = $request->max_combo * 5;
        $burnBonus = $request->burn_mode ? (int)($baseXp * 0.5) : 0;
        $totalXp = $baseXp + $comboBonus + $burnBonus;

        // Save game history
        $game = GameHistory::create([
            'user_id' => $user->id,
            'mode' => $request->mode,
            'total_questions' => $request->total_questions,
            'correct_answers' => $request->correct_answers,
            'wrong_answers' => $request->wrong_answers,
            'xp_earned' => $totalXp,
            'max_combo' => $request->max_combo,
            'burn_mode' => $request->burn_mode ?? false,
            'time_seconds' => $request->time_seconds,
            'played_at' => Carbon::now(),
        ]);

        // Update user XP and level
        $user->xp += $totalXp;
        $user->level = $this->calculateLevel($user->xp);
        $user->save();

        // Update daily quest: play_game
        DailyQuest::where('user_id', $user->id)
            ->where('quest_date', Carbon::today())
            ->where('quest_type', 'play_game')
            ->where('completed', false)
            ->increment('current_value');

        DailyQuest::where('user_id', $user->id)
            ->where('quest_date', Carbon::today())
            ->whereRaw('current_value >= target_value')
            ->where('completed', false)
            ->update(['completed' => true]);

        // Check combo quest
        if ($request->max_combo >= 5) {
            DailyQuest::where('user_id', $user->id)
                ->where('quest_date', Carbon::today())
                ->where('quest_type', 'combo_streak')
                ->where('completed', false)
                ->update(['current_value' => $request->max_combo]);

            DailyQuest::where('user_id', $user->id)
                ->where('quest_date', Carbon::today())
                ->whereRaw('current_value >= target_value')
                ->where('completed', false)
                ->update(['completed' => true]);
        }

        // Check achievements
        $newAchievements = $this->checkAchievements($user);

        // Calculate completed quest XP
        $questXp = DailyQuest::where('user_id', $user->id)
            ->where('quest_date', Carbon::today())
            ->where('completed', true)
            ->sum('xp_reward');

        return response()->json([
            'game' => $game,
            'xp_earned' => $totalXp,
            'xp_breakdown' => [
                'base' => $baseXp,
                'combo_bonus' => $comboBonus,
                'burn_bonus' => $burnBonus,
            ],
            'new_level' => $user->level,
            'total_xp' => $user->xp,
            'new_achievements' => $newAchievements,
        ]);
    }

    public function history(Request $request)
    {
        $history = GameHistory::where('user_id', $request->user()->id)
            ->orderByDesc('played_at')
            ->limit(20)
            ->get();

        return response()->json($history);
    }

    private function calculateLevel(int $xp): int
    {
        // Level thresholds: each level needs progressively more XP
        $level = 1;
        $xpNeeded = 100;
        $remaining = $xp;

        while ($remaining >= $xpNeeded) {
            $remaining -= $xpNeeded;
            $level++;
            $xpNeeded = (int)($xpNeeded * 1.3);
        }

        return $level;
    }

    private function checkAchievements(User $user): array
    {
        $newAchievements = [];
        $achievements = Achievement::all();

        foreach ($achievements as $achievement) {
            // Skip if already unlocked
            if ($user->achievements()->where('achievement_id', $achievement->id)->exists()) {
                continue;
            }

            $unlocked = false;

            switch ($achievement->condition_type) {
                case 'total_correct':
                    $unlocked = $user->total_correct >= $achievement->condition_value;
                    break;
                case 'total_games':
                    $unlocked = GameHistory::where('user_id', $user->id)->count() >= $achievement->condition_value;
                    break;
                case 'streak':
                    $streak = $user->streak;
                    $unlocked = $streak && $streak->current_streak >= $achievement->condition_value;
                    break;
                case 'level':
                    $unlocked = $user->level >= $achievement->condition_value;
                    break;
                case 'xp':
                    $unlocked = $user->xp >= $achievement->condition_value;
                    break;
            }

            if ($unlocked) {
                $user->achievements()->attach($achievement->id, ['unlocked_at' => now()]);
                $user->xp += $achievement->xp_reward;
                $user->save();
                $newAchievements[] = $achievement;
            }
        }

        return $newAchievements;
    }
}
