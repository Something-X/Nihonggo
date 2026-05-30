<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('mode', ['kotoba', 'kanji', 'mixed', 'sentence']);
            $table->unsignedInteger('total_questions')->default(0);
            $table->unsignedInteger('correct_answers')->default(0);
            $table->unsignedInteger('wrong_answers')->default(0);
            $table->unsignedInteger('xp_earned')->default(0);
            $table->unsignedInteger('max_combo')->default(0);
            $table->boolean('burn_mode')->default(false);
            $table->unsignedInteger('time_seconds')->nullable();
            $table->json('details')->nullable();
            $table->timestamp('played_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_histories');
    }
};
