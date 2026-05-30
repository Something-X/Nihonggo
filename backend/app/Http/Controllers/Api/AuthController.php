<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Streak;
use App\Models\DailyQuest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'last_active_at' => Carbon::today(),
        ]);

        // Create streak
        Streak::create(['user_id' => $user->id]);

        // Generate daily quests
        $this->generateDailyQuests($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('streak'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->is_banned) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda telah diblokir.'],
            ]);
        }

        // Update last active & streak
        $user->update(['last_active_at' => Carbon::today()]);
        $this->updateStreak($user);
        $this->generateDailyQuests($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('streak'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load('streak');
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'avatar' => 'sometimes|string|max:255',
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'avatar']));

        return response()->json($user);
    }

    private function updateStreak(User $user): void
    {
        $streak = $user->streak ?? Streak::create(['user_id' => $user->id]);
        $today = Carbon::today();
        $lastDate = $streak->last_streak_date ? Carbon::parse($streak->last_streak_date) : null;

        if (!$lastDate || $lastDate->lt($today)) {
            if ($lastDate && $lastDate->diffInDays($today) === 1) {
                $streak->current_streak++;
            } elseif (!$lastDate || $lastDate->diffInDays($today) > 1) {
                $streak->current_streak = 1;
            }

            $streak->longest_streak = max($streak->longest_streak, $streak->current_streak);
            $streak->last_streak_date = $today;
            $streak->save();
        }
    }

    private function generateDailyQuests(User $user): void
    {
        $today = Carbon::today();

        if (DailyQuest::where('user_id', $user->id)->where('quest_date', $today)->exists()) {
            return;
        }

        $quests = [
            ['quest_type' => 'answer_correct', 'description' => 'Jawab 10 soal dengan benar', 'target_value' => 10, 'xp_reward' => 50],
            ['quest_type' => 'play_game', 'description' => 'Mainkan 3 sesi quiz', 'target_value' => 3, 'xp_reward' => 30],
            ['quest_type' => 'combo_streak', 'description' => 'Raih combo 5x berturut-turut', 'target_value' => 5, 'xp_reward' => 40],
        ];

        foreach ($quests as $quest) {
            DailyQuest::create(array_merge($quest, [
                'user_id' => $user->id,
                'quest_date' => $today,
            ]));
        }
    }
}
