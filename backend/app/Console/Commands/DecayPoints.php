<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AdaptiveEngine;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DecayPoints extends Command
{
    protected $signature = 'nihongo:decay-points';
    protected $description = 'Decay memorization points for inactive users';

    public function handle(): void
    {
        $users = User::whereNotNull('last_active_at')->get();
        $decayed = 0;

        foreach ($users as $user) {
            $daysInactive = Carbon::parse($user->last_active_at)->diffInDays(Carbon::now());

            if ($daysInactive >= 1) {
                AdaptiveEngine::decayPoints($user->id, $daysInactive);
                $decayed++;
                $this->info("Decayed points for user {$user->name} ({$daysInactive} days inactive)");
            }
        }

        $this->info("Done. Decayed points for {$decayed} users.");
    }
}
