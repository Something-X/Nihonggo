import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('kotoba_extracted.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

# Fix meanings - add spaces before capital letters (PDF extraction issue)
def fix_meaning(s):
    if not s:
        return s
    # Add space before uppercase that follows lowercase
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    # Add space before opening parenthesis
    s = re.sub(r'(\w)\(', r'\1 (', s)
    # Clean up multiple spaces
    s = re.sub(r'\s+', ' ', s).strip()
    return s

cleaned = []
seen = set()

for w in words:
    w['meaning'] = fix_meaning(w['meaning'])
    
    # Skip entries with ~ (grammar patterns)
    if w['hiragana'].startswith('～') or w['kanji'].startswith('～'):
        continue
    # Skip too short meanings
    if len(w['meaning']) < 2:
        continue
    
    # Deduplicate by hiragana
    key = w['hiragana']
    if key in seen:
        continue
    seen.add(key)
    
    # Assign bab 0 entries to bab 1
    if w['bab'] == 0:
        w['bab'] = 1
    
    cleaned.append(w)

with open('kotoba_cleaned.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=2)

print(f"Cleaned: {len(cleaned)} words (from {len(words)} raw)")

# Show some samples
for w in cleaned[:15]:
    print(f"  Bab {w['bab']}: {w['kanji']} ({w['hiragana']}) = {w['meaning']}")
