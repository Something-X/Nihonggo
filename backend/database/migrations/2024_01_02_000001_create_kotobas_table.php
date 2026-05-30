<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kotobas', function (Blueprint $table) {
            $table->id();
            $table->string('japanese');
            $table->string('romaji')->nullable();
            $table->string('meaning');
            $table->string('example_sentence')->nullable();
            $table->string('audio_url')->nullable();
            $table->string('image_url')->nullable();
            $table->enum('difficulty', ['N5', 'N4', 'N3', 'N2', 'N1'])->default('N5');
            $table->string('category')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kotobas');
    }
};
