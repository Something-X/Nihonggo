<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sentences', function (Blueprint $table) {
            $table->id();
            $table->text('japanese');
            $table->string('romaji')->nullable();
            $table->text('meaning');
            $table->json('words_json');
            $table->enum('difficulty', ['N5', 'N4', 'N3', 'N2', 'N1'])->default('N5');
            $table->timestamps();
        });

        Schema::create('sentence_kotobas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sentence_id')->constrained()->cascadeOnDelete();
            $table->foreignId('kotoba_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sentence_kotobas');
        Schema::dropIfExists('sentences');
    }
};
