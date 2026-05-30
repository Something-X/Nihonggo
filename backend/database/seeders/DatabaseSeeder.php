<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Streak;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@nihongo.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'last_active_at' => now(),
        ]);
        Streak::create(['user_id' => $admin->id]);

        // Create test user
        $user = User::create([
            'name' => 'Riko',
            'email' => 'riko@nihongo.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'last_active_at' => now(),
        ]);
        Streak::create(['user_id' => $user->id]);

        $this->call([
            KotobaSeeder::class,
            KanjiSeeder::class,
            SentenceSeeder::class,
            AchievementSeeder::class,
        ]);
    }
}
