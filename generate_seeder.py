import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('kotoba_cleaned.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

# Map bab to difficulty
def bab_to_difficulty(bab):
    if bab <= 25:
        return 'N5'
    elif bab <= 50:
        return 'N4'
    return 'N5'

# Map bab to category
def bab_to_category(bab):
    return f'minna_bab_{bab}'

lines = []
lines.append("<?php\n")
lines.append("namespace Database\\Seeders;\n")
lines.append("use App\\Models\\Kotoba;")
lines.append("use Illuminate\\Database\\Seeder;\n")
lines.append("class KotobaSeeder extends Seeder")
lines.append("{")
lines.append("    public function run(): void")
lines.append("    {")
lines.append("        $kotobas = [")

for w in words:
    jp = w['kanji'] if w['kanji'] else w['hiragana']
    romaji = ''  # We'll leave romaji empty for now
    meaning = w['meaning'].replace("'", "\\'")
    cat = bab_to_category(w['bab'])
    diff = bab_to_difficulty(w['bab'])
    hiragana = w['hiragana']
    
    lines.append(f"            ['japanese'=>'{jp}','romaji'=>'{hiragana}','meaning'=>'{meaning}','category'=>'{cat}','difficulty'=>'{diff}'],")

lines.append("        ];\n")
lines.append("        // Clear old data and re-seed")
lines.append("        Kotoba::truncate();\n")
lines.append("        foreach (array_chunk($kotobas, 100) as $chunk) {")
lines.append("            foreach ($chunk as $k) {")
lines.append("                Kotoba::create($k);")
lines.append("            }")
lines.append("        }")
lines.append("    }")
lines.append("}")
lines.append("")

with open('backend/database/seeders/KotobaSeeder.php', 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))

print(f"Generated KotobaSeeder.php with {len(words)} entries")
