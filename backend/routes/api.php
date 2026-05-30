<?php

use App\Http\Controllers\Api\{AuthController, DashboardController, QuizController, SentenceController, GamificationController, AdminController};
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/stats/progress', [DashboardController::class, 'progressChart']);
    Route::get('/stats/accuracy', [DashboardController::class, 'accuracyChart']);
    Route::get('/leaderboard', [DashboardController::class, 'leaderboard']);

    // Quiz
    Route::post('/quiz/start', [QuizController::class, 'start']);
    Route::post('/quiz/answer', [QuizController::class, 'answer']);
    Route::post('/quiz/finish', [QuizController::class, 'finish']);
    Route::get('/quiz/history', [QuizController::class, 'history']);

    // Library
    Route::get('/library/chapters', [DashboardController::class, 'libraryChapters']);
    Route::get('/library/words', [DashboardController::class, 'libraryWords']);

    // Sentence
    Route::post('/sentence/start', [SentenceController::class, 'start']);
    Route::post('/sentence/answer', [SentenceController::class, 'answer']);

    // Gamification
    Route::get('/achievements', [GamificationController::class, 'achievements']);
    Route::get('/quests/daily', [GamificationController::class, 'dailyQuests']);
    Route::get('/streak', [GamificationController::class, 'streak']);

    // Admin routes
    Route::middleware('can:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        // Kotoba
        Route::get('/kotobas', [AdminController::class, 'kotobaIndex']);
        Route::post('/kotobas', [AdminController::class, 'kotobaStore']);
        Route::put('/kotobas/{kotoba}', [AdminController::class, 'kotobaUpdate']);
        Route::delete('/kotobas/{kotoba}', [AdminController::class, 'kotobaDestroy']);
        // Kanji
        Route::get('/kanjis', [AdminController::class, 'kanjiIndex']);
        Route::post('/kanjis', [AdminController::class, 'kanjiStore']);
        Route::put('/kanjis/{kanji}', [AdminController::class, 'kanjiUpdate']);
        Route::delete('/kanjis/{kanji}', [AdminController::class, 'kanjiDestroy']);
        // Sentence
        Route::get('/sentences', [AdminController::class, 'sentenceIndex']);
        Route::post('/sentences', [AdminController::class, 'sentenceStore']);
        Route::put('/sentences/{sentence}', [AdminController::class, 'sentenceUpdate']);
        Route::delete('/sentences/{sentence}', [AdminController::class, 'sentenceDestroy']);
        // Users
        Route::get('/users', [AdminController::class, 'userIndex']);
        Route::put('/users/{user}', [AdminController::class, 'userUpdate']);
        Route::post('/users/{user}/reset', [AdminController::class, 'userResetProgress']);
        Route::delete('/users/{user}', [AdminController::class, 'userDestroy']);
    });
});
