<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('icon')->default('🏆');
            $table->string('condition_type');
            $table->unsignedInteger('condition_value');
            $table->unsignedInteger('xp_reward')->default(0);
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('unlocked_at')->useCurrent();
            $table->unique(['user_id', 'achievement_id']);
        });

        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->unsignedInteger('current_streak')->default(0);
            $table->unsignedInteger('longest_streak')->default(0);
            $table->date('last_streak_date')->nullable();
            $table->timestamps();
        });

        Schema::create('daily_quests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('quest_type');
            $table->string('description');
            $table->unsignedInteger('target_value');
            $table->unsignedInteger('current_value')->default(0);
            $table->boolean('completed')->default(false);
            $table->unsignedInteger('xp_reward')->default(0);
            $table->date('quest_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_quests');
        Schema::dropIfExists('streaks');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
