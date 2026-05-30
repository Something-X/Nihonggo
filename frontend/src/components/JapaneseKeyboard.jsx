import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HIRAGANA_ROWS = [
  ['あ','い','う','え','お'],
  ['か','き','く','け','こ'],
  ['さ','し','す','せ','そ'],
  ['た','ち','つ','て','と'],
  ['な','に','ぬ','ね','の'],
  ['は','ひ','ふ','へ','ほ'],
  ['ま','み','む','め','も'],
  ['や','','ゆ','','よ'],
  ['ら','り','る','れ','ろ'],
  ['わ','を','ん','ー',''],
];

const HIRAGANA_DAKUTEN = [
  ['が','ぎ','ぐ','げ','ご'],
  ['ざ','じ','ず','ぜ','ぞ'],
  ['だ','ぢ','づ','で','ど'],
  ['ば','び','ぶ','べ','ぼ'],
  ['ぱ','ぴ','ぷ','ぺ','ぽ'],
];

const KATAKANA_ROWS = [
  ['ア','イ','ウ','エ','オ'],
  ['カ','キ','ク','ケ','コ'],
  ['サ','シ','ス','セ','ソ'],
  ['タ','チ','ツ','テ','ト'],
  ['ナ','ニ','ヌ','ネ','ノ'],
  ['ハ','ヒ','フ','ヘ','ホ'],
  ['マ','ミ','ム','メ','モ'],
  ['ヤ','','ユ','','ヨ'],
  ['ラ','リ','ル','レ','ロ'],
  ['ワ','ヲ','ン','ー',''],
];

const KATAKANA_DAKUTEN = [
  ['ガ','ギ','グ','ゲ','ゴ'],
  ['ザ','ジ','ズ','ゼ','ゾ'],
  ['ダ','ヂ','ヅ','デ','ド'],
  ['バ','ビ','ブ','ベ','ボ'],
  ['パ','ピ','プ','ペ','ポ'],
];

const SMALL_CHARS = {
  hiragana: ['ぁ','ぃ','ぅ','ぇ','ぉ','っ','ゃ','ゅ','ょ'],
  katakana: ['ァ','ィ','ゥ','ェ','ォ','ッ','ャ','ュ','ョ'],
};

// Row labels for reference
const ROW_LABELS = ['あ','か','さ','た','な','は','ま','や','ら','わ'];
const DAKUTEN_LABELS = ['が','ざ','だ','ば','ぱ'];

export default function JapaneseKeyboard({ onInput, onDelete, onSubmit, value = '' }) {
  const [mode, setMode] = useState('hiragana'); // hiragana | katakana
  const [subMode, setSubMode] = useState('seion'); // seion | dakuten | small
  const [pressedKey, setPressedKey] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const keyboardRef = useRef(null);

  const currentRows = mode === 'hiragana'
    ? (subMode === 'dakuten' ? HIRAGANA_DAKUTEN : HIRAGANA_ROWS)
    : (subMode === 'dakuten' ? KATAKANA_DAKUTEN : KATAKANA_ROWS);

  const smallChars = SMALL_CHARS[mode];

  // Key press animation
  const handleKeyPress = (char) => {
    setPressedKey(char);
    onInput(char);
    setTimeout(() => setPressedKey(null), 150);
  };

  // Physical keyboard support (Backspace to delete, Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDelete, onSubmit]);

  // Scroll to bottom when keyboard opens
  useEffect(() => {
    if (!isCollapsed && keyboardRef.current) {
      setTimeout(() => {
        keyboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [isCollapsed]);

  return (
    <motion.div
      ref={keyboardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="mt-4 relative"
    >
      {/* Input Display Area */}
      <div className="relative mb-3">
        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-800 rounded-2xl border-2 border-primary-200 dark:border-primary-500/30 shadow-lg shadow-primary-500/5 min-h-[56px] transition-all focus-within:border-primary-500 focus-within:shadow-primary-500/15">
          <div className="flex-1 flex items-center gap-1 min-h-[32px] flex-wrap">
            {value ? (
              <motion.span
                key={value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-jp tracking-wider leading-relaxed"
              >
                {value}
              </motion.span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-lg select-none">入力してください...</span>
            )}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-0.5 h-7 bg-primary-500 rounded-full inline-block"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onDelete}
              className="p-2.5 rounded-xl text-gray-400 hover:text-nihon-500 hover:bg-nihon-500/10 active:scale-90 transition-all"
              title="Hapus"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/>
                <line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 rounded-xl text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 active:scale-90 transition-all"
              title={isCollapsed ? '展開 Buka' : '折りたたむ Tutup'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Body */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-800 dark:to-dark-850 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/30 p-3 sm:p-4">
              {/* Mode Tabs */}
              <div className="flex gap-1.5 mb-3 bg-gray-200/60 dark:bg-dark-900/60 p-1 rounded-xl">
                <button
                  onClick={() => { setMode('hiragana'); setSubMode('seion'); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    mode === 'hiragana'
                      ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-md shadow-primary-500/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className="text-lg mr-1">あ</span> ひらがな
                </button>
                <button
                  onClick={() => { setMode('katakana'); setSubMode('seion'); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    mode === 'katakana'
                      ? 'bg-white dark:bg-dark-800 text-sakura-600 dark:text-sakura-400 shadow-md shadow-sakura-500/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span className="text-lg mr-1">ア</span> カタカナ
                </button>
              </div>

              {/* Sub-mode tabs */}
              <div className="flex gap-1.5 mb-3">
                {[
                  { key: 'seion', label: '清音', sublabel: 'Seion' },
                  { key: 'dakuten', label: '濁音', sublabel: 'Dakuten' },
                  { key: 'small', label: '小文字', sublabel: 'Kecil' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSubMode(tab.key)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      subMode === tab.key
                        ? mode === 'hiragana'
                          ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30'
                          : 'bg-sakura-500/15 text-sakura-600 dark:text-sakura-400 border border-sakura-500/30'
                        : 'bg-white/50 dark:bg-white/5 text-gray-500 border border-transparent hover:bg-white dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="block text-sm">{tab.label}</span>
                    <span className="block text-[10px] opacity-60">{tab.sublabel}</span>
                  </button>
                ))}
              </div>

              {/* Key Grid */}
              <div className="space-y-1.5">
                {subMode === 'small' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-5 gap-1.5"
                  >
                    {smallChars.map((char, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleKeyPress(char)}
                        className={`py-3 sm:py-3.5 rounded-xl text-lg sm:text-xl font-jp font-medium transition-all duration-100
                          bg-white dark:bg-dark-800 border border-gray-200/80 dark:border-white/10
                          hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/30
                          active:bg-primary-100 dark:active:bg-primary-500/20
                          shadow-sm hover:shadow-md
                          ${pressedKey === char ? 'bg-primary-100 dark:bg-primary-500/20 border-primary-400 scale-90' : ''}`}
                      >
                        {char}
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  currentRows.map((row, ri) => (
                    <motion.div
                      key={ri}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ri * 0.02 }}
                      className="grid grid-cols-5 gap-1.5"
                    >
                      {row.map((char, ci) =>
                        char ? (
                          <motion.button
                            key={ci}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleKeyPress(char)}
                            className={`py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-jp font-medium transition-all duration-100
                              bg-white dark:bg-dark-800 border border-gray-200/80 dark:border-white/10
                              hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/30
                              active:bg-primary-100 dark:active:bg-primary-500/20
                              shadow-sm hover:shadow-md
                              ${pressedKey === char ? 'bg-primary-100 dark:bg-primary-500/20 border-primary-400 scale-90' : ''}`}
                          >
                            {char}
                          </motion.button>
                        ) : (
                          <div key={ci} className="rounded-xl" />
                        )
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Punctuation Row */}
              <div className="flex gap-1.5 mt-3">
                {['（', '）', '「', '」', '、', '。'].map((char) => (
                  <button
                    key={char}
                    onClick={() => handleKeyPress(char)}
                    className={`flex-1 py-2.5 rounded-xl text-base font-jp font-medium transition-all duration-100
                      bg-white dark:bg-dark-800 border border-gray-200/80 dark:border-white/10
                      hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300
                      active:scale-90 shadow-sm hover:shadow-md
                      ${pressedKey === char ? 'bg-primary-100 dark:bg-primary-500/20 border-primary-400 scale-90' : ''}`}
                  >
                    {char}
                  </button>
                ))}
              </div>

              {/* Bottom Action Row */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onInput('　')}
                  className="flex-1 py-3 rounded-xl bg-white dark:bg-dark-800 border border-gray-200/80 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md transition-all active:scale-95 shadow-sm"
                >
                  ⎵ スペース
                </button>
                <button
                  onClick={onSubmit}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg hover:shadow-xl ${
                    mode === 'hiragana'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-primary-500/25'
                      : 'bg-gradient-to-r from-sakura-500 to-sakura-600 hover:from-sakura-600 hover:to-sakura-700 shadow-sakura-500/25'
                  }`}
                >
                  送信 Submit ➡️
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
