<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            ['name'=>'Pemula','description'=>'Jawab 10 soal dengan benar','icon'=>'🌱','condition_type'=>'total_correct','condition_value'=>10,'xp_reward'=>20],
            ['name'=>'Pejuang','description'=>'Jawab 50 soal dengan benar','icon'=>'⚔️','condition_type'=>'total_correct','condition_value'=>50,'xp_reward'=>50],
            ['name'=>'Samurai','description'=>'Jawab 200 soal dengan benar','icon'=>'🗡️','condition_type'=>'total_correct','condition_value'=>200,'xp_reward'=>100],
            ['name'=>'Shogun','description'=>'Jawab 500 soal dengan benar','icon'=>'👑','condition_type'=>'total_correct','condition_value'=>500,'xp_reward'=>200],
            ['name'=>'Quiz Lover','description'=>'Mainkan 10 sesi quiz','icon'=>'🎮','condition_type'=>'total_games','condition_value'=>10,'xp_reward'=>30],
            ['name'=>'Quiz Master','description'=>'Mainkan 50 sesi quiz','icon'=>'🏆','condition_type'=>'total_games','condition_value'=>50,'xp_reward'=>100],
            ['name'=>'On Fire','description'=>'Login 3 hari berturut-turut','icon'=>'🔥','condition_type'=>'streak','condition_value'=>3,'xp_reward'=>30],
            ['name'=>'Konsisten','description'=>'Login 7 hari berturut-turut','icon'=>'💪','condition_type'=>'streak','condition_value'=>7,'xp_reward'=>70],
            ['name'=>'Legenda','description'=>'Login 30 hari berturut-turut','icon'=>'🌟','condition_type'=>'streak','condition_value'=>30,'xp_reward'=>300],
            ['name'=>'Level 5','description'=>'Mencapai level 5','icon'=>'⭐','condition_type'=>'level','condition_value'=>5,'xp_reward'=>50],
            ['name'=>'Level 10','description'=>'Mencapai level 10','icon'=>'🌙','condition_type'=>'level','condition_value'=>10,'xp_reward'=>100],
            ['name'=>'XP Hunter','description'=>'Kumpulkan 1000 XP','icon'=>'💎','condition_type'=>'xp','condition_value'=>1000,'xp_reward'=>50],
        ];

        foreach ($achievements as $a) {
            Achievement::create($a);
        }
    }
}
