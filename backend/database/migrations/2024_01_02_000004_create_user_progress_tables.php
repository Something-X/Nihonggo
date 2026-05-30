<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_kotoba_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('kotoba_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('point')->default(0);
            $table->unsignedInteger('times_correct')->default(0);
            $table->unsignedInteger('times_wrong')->default(0);
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamp('next_review_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'kotoba_id']);
        });

        Schema::create('user_kanji_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('kanji_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('point')->default(0);
            $table->unsignedInteger('times_correct')->default(0);
            $table->unsignedInteger('times_wrong')->default(0);
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamp('next_review_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'kanji_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_kanji_progress');
        Schema::dropIfExists('user_kotoba_progress');
    }
};
