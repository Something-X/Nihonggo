<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kanjis', function (Blueprint $table) {
            $table->id();
            $table->string('character', 10);
            $table->string('onyomi')->nullable();
            $table->string('kunyomi')->nullable();
            $table->string('meaning');
            $table->unsignedSmallInteger('stroke_count')->default(0);
            $table->string('audio_url')->nullable();
            $table->string('image_url')->nullable();
            $table->enum('difficulty', ['N5', 'N4', 'N3', 'N2', 'N1'])->default('N5');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kanjis');
    }
};
