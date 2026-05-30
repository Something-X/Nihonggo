<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\DailyQuest;
use App\Models\Streak;
use Illuminate\Http\Request;
use Carbon\Carbon;

class GamificationController extends Controller
{
    public function achievements(Request $request)
    {
        $user = $request->user();
        $all = Achievement::all();
        $unlocked = $user->achievements()->pluck('achievement_id')->toArray();

        $data = $all->map(function ($a) use ($unlocked) {
            return [
                'id' => $a->id, 'name' => $a->name,
                'description' => $a->description, 'icon' => $a->icon,
                'xp_reward' => $a->xp_reward,
                'unlocked' => in_array($a->id, $unlocked),
            ];
        });
        return response()->json($data);
    }

    public function dailyQuests(Request $request)
    {
        return response()->json(
            DailyQuest::where('user_id', $request->user()->id)
                ->where('quest_date', Carbon::today())->get()
        );
    }

    public function streak(Request $request)
    {
        $streak = $request->user()->streak ?? Streak::create(['user_id' => $request->user()->id]);
        return response()->json($streak);
    }
}
