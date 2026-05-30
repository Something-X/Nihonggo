import pdfplumber
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf = pdfplumber.open('kotoba_mnn.pdf')
all_words = []
current_bab = 0

for page in pdf.pages:
    text = page.extract_text() or ''
    # Detect chapter from text
    bab_match = re.search(r'[Bb]ab\s*(\d+)', text)
    if bab_match:
        current_bab = int(bab_match.group(1))
    
    tables = page.extract_tables() or []
    for table in tables:
        for row in table:
            if not row or len(row) < 4:
                continue
            no, kanji, hiragana, arti = row[0], row[1], row[2], row[3]
            
            # Skip header rows
            if not arti or arti.strip() in ('Arti', '', 'No'):
                continue
            if kanji and kanji.strip() in ('Kanji', 'No'):
                continue
            
            kanji = (kanji or '').strip()
            hiragana = (hiragana or '').strip()
            arti = (arti or '').strip()
            
            # Skip empty or malformed rows
            if not hiragana or not arti:
                continue
            # Skip rows that are just grammar patterns or too long
            if len(arti) > 80:
                continue
            # Skip greeting/phrase entries (too long for flashcard)
            if len(hiragana) > 20:
                continue
                
            word = {
                'kanji': kanji,
                'hiragana': hiragana,
                'meaning': arti,
                'bab': current_bab
            }
            all_words.append(word)

pdf.close()

# Write as JSON
with open('kotoba_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(all_words)} words from {len(pdf.pages)} pages")
print(f"Chapters found: {sorted(set(w['bab'] for w in all_words))}")
# Print first 10 samples
for w in all_words[:10]:
    print(f"  Bab {w['bab']}: {w['kanji']} ({w['hiragana']}) = {w['meaning']}")
