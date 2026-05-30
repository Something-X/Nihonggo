<?php

namespace App\Services;

use App\Models\Kotoba;
use App\Models\Kanji;
use App\Models\UserKotobaProgress;
use App\Models\UserKanjiProgress;
use Carbon\Carbon;

class AdaptiveEngine
{
    /**
     * Weight mapping based on point ranges.
     * Lower points = higher weight = more frequent appearance
     */
    private const WEIGHT_MAP = [
        [0, 20, 5.0],
        [21, 50, 3.0],
        [51, 80, 2.0],
        [81, 99, 1.0],
        [100, 100, 0.3],
    ];

    /**
     * Spaced repetition intervals in hours based on point ranges
     */
    private const REVIEW_INTERVALS = [
        [0, 20, 1],
        [21, 50, 6],
        [51, 80, 24],
        [81, 99, 72],
        [100, 100, 168],
    ];

    /**
     * Get adaptive questions for a quiz session
     */
    public function getAdaptiveQuestions(int $userId, string $mode, int $count): array
    {
        $questions = [];

        if ($mode === 'kotoba' || $mode === 'mixed') {
            $questions = array_merge($questions, $this->getKotobaQuestions($userId, $count));
        }

        if ($mode === 'kanji' || $mode === 'mixed') {
            $questions = array_merge($questions, $this->getKanjiQuestions($userId, $count));
        }

        // Shuffle and limit
        shuffle($questions);
        return array_slice($questions, 0, $count);
    }

    private function getKotobaQuestions(int $userId, int $limit): array
    {
        $kotobas = Kotoba::all();
        $progressMap = UserKotobaProgress::where('user_id', $userId)
            ->pluck('point', 'kotoba_id')
            ->toArray();

        $weighted = [];
        foreach ($kotobas as $kotoba) {
            $point = $progressMap[$kotoba->id] ?? 0;
            $weight = $this->getWeight($point);

            // Boost weight if review is due
            $progress = UserKotobaProgress::where('user_id', $userId)
                ->where('kotoba_id', $kotoba->id)->first();
            if ($progress && $progress->next_review_at && Carbon::now()->gte($progress->next_review_at)) {
                $weight *= 2;
            }

            $weighted[] = [
                'item' => $kotoba,
                'type' => 'kotoba',
                'point' => $point,
                'weight' => $weight,
            ];
        }

        return $this->weightedSelect($weighted, $limit);
    }

    private function getKanjiQuestions(int $userId, int $limit): array
    {
        $kanjis = Kanji::all();
        $progressMap = UserKanjiProgress::where('user_id', $userId)
            ->pluck('point', 'kanji_id')
            ->toArray();

        $weighted = [];
        foreach ($kanjis as $kanji) {
            $point = $progressMap[$kanji->id] ?? 0;
            $weight = $this->getWeight($point);

            $progress = UserKanjiProgress::where('user_id', $userId)
                ->where('kanji_id', $kanji->id)->first();
            if ($progress && $progress->next_review_at && Carbon::now()->gte($progress->next_review_at)) {
                $weight *= 2;
            }

            $weighted[] = [
                'item' => $kanji,
                'type' => 'kanji',
                'point' => $point,
                'weight' => $weight,
            ];
        }

        return $this->weightedSelect($weighted, $limit);
    }

    private function weightedSelect(array $items, int $count): array
    {
        if (empty($items)) return [];

        $selected = [];
        $totalWeight = array_sum(array_column($items, 'weight'));

        for ($i = 0; $i < min($count, count($items)); $i++) {
            $rand = mt_rand(0, (int)($totalWeight * 1000)) / 1000;
            $cumulative = 0;

            foreach ($items as $key => $item) {
                $cumulative += $item['weight'];
                if ($rand <= $cumulative) {
                    $selected[] = $item;
                    $totalWeight -= $item['weight'];
                    unset($items[$key]);
                    $items = array_values($items);
                    break;
                }
            }
        }

        return $selected;
    }

    private function getWeight(int $point): float
    {
        foreach (self::WEIGHT_MAP as [$min, $max, $weight]) {
            if ($point >= $min && $point <= $max) {
                return $weight;
            }
        }
        return 1.0;
    }

    /**
     * Generate a question from a selected item
     */
    public function generateQuestion(array $selectedItem): array
    {
        $item = $selectedItem['item'];
        $type = $selectedItem['type'];

        if ($type === 'kotoba') {
            return $this->generateKotobaQuestion($item);
        }

        return $this->generateKanjiQuestion($item);
    }

    private function generateKotobaQuestion($kotoba): array
    {
        $questionTypes = ['jp_to_id', 'id_to_jp'];
        $qType = $questionTypes[array_rand($questionTypes)];

        // Get wrong options
        $wrongOptions = Kotoba::where('id', '!=', $kotoba->id)
            ->inRandomOrder()->limit(3)->get();

        if ($qType === 'jp_to_id') {
            $options = $wrongOptions->pluck('meaning')->toArray();
            $options[] = $kotoba->meaning;
            shuffle($options);

            return [
                'id' => $kotoba->id,
                'type' => 'kotoba',
                'question_type' => 'jp_to_id',
                'question' => $kotoba->japanese,
                'question_label' => 'Apa arti dari kata ini?',
                'correct_answer' => $kotoba->meaning,
                'options' => $options,
                'romaji' => $kotoba->romaji,
            ];
        }

        $options = $wrongOptions->pluck('japanese')->toArray();
        $options[] = $kotoba->japanese;
        shuffle($options);

        return [
            'id' => $kotoba->id,
            'type' => 'kotoba',
            'question_type' => 'id_to_jp',
            'question' => $kotoba->meaning,
            'question_label' => 'Bahasa Jepang dari kata ini?',
            'correct_answer' => $kotoba->japanese,
            'options' => $options,
            'romaji' => $kotoba->romaji,
        ];
    }

    private function generateKanjiQuestion($kanji): array
    {
        $questionTypes = ['kanji_to_meaning', 'kanji_to_reading'];
        $qType = $questionTypes[array_rand($questionTypes)];

        $wrongOptions = Kanji::where('id', '!=', $kanji->id)
            ->inRandomOrder()->limit(3)->get();

        if ($qType === 'kanji_to_meaning') {
            $options = $wrongOptions->pluck('meaning')->toArray();
            $options[] = $kanji->meaning;
            shuffle($options);

            return [
                'id' => $kanji->id,
                'type' => 'kanji',
                'question_type' => 'kanji_to_meaning',
                'question' => $kanji->character,
                'question_label' => 'Apa arti kanji ini?',
                'correct_answer' => $kanji->meaning,
                'options' => $options,
            ];
        }

        $options = $wrongOptions->pluck('kunyomi')->toArray();
        $options[] = $kanji->kunyomi;
        shuffle($options);

        return [
            'id' => $kanji->id,
            'type' => 'kanji',
            'question_type' => 'kanji_to_reading',
            'question' => $kanji->character,
            'question_label' => 'Bagaimana cara baca kanji ini?',
            'correct_answer' => $kanji->kunyomi,
            'options' => $options,
        ];
    }

    /**
     * Process answer and update progress
     */
    public function processAnswer(int $userId, int $itemId, string $type, bool $isCorrect): array
    {
        if ($type === 'kotoba') {
            $progress = UserKotobaProgress::firstOrCreate(
                ['user_id' => $userId, 'kotoba_id' => $itemId],
                ['point' => 0, 'times_correct' => 0, 'times_wrong' => 0]
            );
        } else {
            $progress = UserKanjiProgress::firstOrCreate(
                ['user_id' => $userId, 'kanji_id' => $itemId],
                ['point' => 0, 'times_correct' => 0, 'times_wrong' => 0]
            );
        }

        $oldPoint = $progress->point;

        if ($isCorrect) {
            $progress->point = min(100, $progress->point + 5);
            $progress->times_correct++;
        } else {
            $progress->point = max(0, $progress->point - 7);
            $progress->times_wrong++;
        }

        $progress->last_reviewed_at = Carbon::now();
        $progress->next_review_at = $this->getNextReviewAt($progress->point);
        $progress->save();

        return [
            'old_point' => $oldPoint,
            'new_point' => $progress->point,
            'is_correct' => $isCorrect,
        ];
    }

    private function getNextReviewAt(int $point): Carbon
    {
        foreach (self::REVIEW_INTERVALS as [$min, $max, $hours]) {
            if ($point >= $min && $point <= $max) {
                return Carbon::now()->addHours($hours);
            }
        }
        return Carbon::now()->addDay();
    }

    /**
     * Decay points for inactive users
     */
    public static function decayPoints(int $userId, int $daysInactive): void
    {
        $decay = 0;
        if ($daysInactive >= 7) {
            $decay = 10;
        } elseif ($daysInactive >= 1) {
            $decay = 2 * $daysInactive;
        }

        if ($decay > 0) {
            UserKotobaProgress::where('user_id', $userId)
                ->where('point', '>', 0)
                ->decrement('point', $decay);

            // Ensure no negative points
            UserKotobaProgress::where('user_id', $userId)
                ->where('point', '<', 0)
                ->update(['point' => 0]);

            UserKanjiProgress::where('user_id', $userId)
                ->where('point', '>', 0)
                ->decrement('point', $decay);

            UserKanjiProgress::where('user_id', $userId)
                ->where('point', '<', 0)
                ->update(['point' => 0]);
        }
    }
}
