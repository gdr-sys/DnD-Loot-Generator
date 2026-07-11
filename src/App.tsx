import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from './i18n/translations';
import { generateIndividual2014, generateHoard2014 } from './core/generator2014';
import { generateIndividual2024, generateHoard2024, generateMagicItemByTheme } from './core/generator2024';
import { getItemName, getItemDescription, getMagicItemData } from './data/magic-items-database';
import { getGemName, getArtName } from './i18n/translations-items';
import type { TreasureResult, MagicItemResult } from './core/generator2014';

type Screen = 'welcome' | 'generator';
type Lang = 'en' | 'it';
type ThemeMode = 'dark' | 'light' | 'system';

// CR fasce raggruppate come da DMG (0-4, 5-10, 11-16, 17+)
const CR_TIERS = [
  { value: '0-4', label: 'CR 0–4', examples: 'Mostri deboli (Kobold, Goblin)' },
  { value: '5-10', label: 'CR 5–10', examples: 'Avventurieri esperti (Orco, Hobgoblin, Beholder)' },
  { value: '11-16', label: 'CR 11–16', examples: 'Eroi veterani (Gigante delle Nubi, Lich)' },
  { value: '17+', label: 'CR 17+', examples: 'Leggende (Drago Antico, Demilich)' },
];

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  'very rare': 'text-purple-400',
  legendary: 'text-orange-400',
};

const RARITY_BG: Record<string, string> = {
  common: 'bg-gray-500/20 border-gray-500/40',
  uncommon: 'bg-green-500/20 border-green-500/40',
  rare: 'bg-blue-500/20 border-blue-500/40',
  'very rare': 'bg-purple-500/20 border-purple-500/40',
  legendary: 'bg-orange-500/20 border-orange-500/40',
};

const COIN_ICONS: Record<string, string> = {
  cp: '🟤',
  sp: '⚪',
  ep: '🔵',
  gp: '🟡',
  pp: '⚪',
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'it' || saved === 'en') ? saved : 'en';
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'dark';
  });
  const [edition, setEdition] = useState<'2014' | '2024'>('2024');
  const [cr, setCr] = useState('5');
  const [treasureType, setTreasureType] = useState<'individual' | 'hoard' | 'magicitem'>('hoard');
  const [theme2024, setTheme2024] = useState<string>('random');
  const [rarity2024, setRarity2024] = useState<string>('uncommon');
  const [result, setResult] = useState<TreasureResult | null>(null);
  const [singleItem, setSingleItem] = useState<MagicItemResult | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<TreasureResult[]>(() => {
    try {
      const saved = localStorage.getItem('rollHistory');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const resultRef = useRef<HTMLDivElement>(null);
  const t = useTranslation(lang);

  // Theme management
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('rollHistory', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Roll logic
  const roll = useCallback(() => {
    setIsRolling(true);
    setSingleItem(null);
    setResult(null);

    setTimeout(() => {
      let newResult: TreasureResult | null = null;
      let newSingle: MagicItemResult | null = null;

      if (edition === '2024' && treasureType === 'magicitem') {
        newSingle = generateMagicItemByTheme(theme2024, rarity2024);
        setSingleItem(newSingle);
      } else if (edition === '2014') {
        if (treasureType === 'individual') {
          newResult = generateIndividual2014(cr);
        } else {
          newResult = generateHoard2014(cr);
        }
      } else {
        if (treasureType === 'individual') {
          newResult = generateIndividual2024(cr);
        } else {
          newResult = generateHoard2024(cr);
        }
      }

      if (newResult) {
        setResult(newResult);
        setHistory(prev => [newResult!, ...prev].slice(0, 50));
      }

      setIsRolling(false);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 600);
  }, [edition, treasureType, cr, theme2024, rarity2024]);

  // Copy to clipboard
  const copyResult = useCallback(() => {
    if (!result && !singleItem) return;

    let text = '';
    if (singleItem) {
      const name = getItemName(singleItem.name, lang);
      const desc = getItemDescription(singleItem.name, lang);
      text = `${name}\n${desc}`;
    } else if (result) {
      text = `D&D Loot (${result.edition}) - CR ${result.cr} ${result.type}\n\n`;
      if (result.coins.length > 0) {
        text += t('result.coins') + ':\n';
        result.coins.forEach(c => {
          text += `  ${COIN_ICONS[c.type]} ${formatNumber(c.amount)} ${t(c.type)}\n`;
        });
      }
      if (result.gems.length > 0) {
        text += `\n${t('result.gems')}:\n`;
        result.gems.forEach(g => {
          text += `  💎 ${getGemName(g.name, g.value, lang)} (${formatNumber(g.value)} ${t('gp')})\n`;
        });
      }
      if (result.art.length > 0) {
        text += `\n${t('result.art')}:\n`;
        result.art.forEach(a => {
          text += `  🎨 ${getArtName(a.name, a.value, lang)} (${formatNumber(a.value)} ${t('gp')})\n`;
        });
      }
      if (result.magicItems.length > 0) {
        text += `\n${t('result.magicitems')}:\n`;
        result.magicItems.forEach(m => {
          text += `  ✨ ${getItemName(m.name, lang)}\n`;
        });
      }
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result, singleItem, lang, t]);

  // Share
  const shareResult = useCallback(() => {
    if (!navigator.share) return;
    let text = '';
    if (singleItem) {
      text = `✨ ${getItemName(singleItem.name, lang)}`;
    } else if (result) {
      text = `🎲 D&D Loot (${result.edition}) - CR ${result.cr}\n`;
      result.coins.forEach(c => { text += `${COIN_ICONS[c.type]} ${formatNumber(c.amount)} ${t(c.type)} `; });
      if (result.magicItems.length > 0) {
        text += '\n✨ ' + result.magicItems.map(m => getItemName(m.name, lang)).join(', ');
      }
    }
    navigator.share({ title: 'D&D Loot', text });
  }, [result, singleItem, lang, t]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-8 transition-colors duration-300 ${isDark ? 'bg-[#0d0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="w-full max-w-md text-center space-y-8 animate-fadeIn">
          {/* Logo */}
          <div className="space-y-4">
            <div className="text-7xl animate-float">🎲</div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('app.title')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('app.subtitle')}
            </p>
          </div>

          {/* Edition Selection */}
          <div className="space-y-3">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('edition.label')}
            </label>
            <div className="flex gap-3 justify-center">
              {(['2014', '2024'] as const).map(ed => (
                <button
                  key={ed}
                  onClick={() => setEdition(ed)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all min-h-[56px] ${
                    edition === ed
                      ? isDark
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-500 text-white shadow-lg shadow-indigo-300/50'
                      : isDark
                        ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                  }`}
                >
                  {t(`edition.${ed}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center gap-3">
            {([['en', '🇬🇧'], ['it', '🇮🇹']] as const).map(([l, flag]) => (
              <button
                key={l}
                onClick={() => setLang(l as Lang)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[48px] flex items-center gap-2 ${
                  lang === l
                    ? isDark
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{flag}</span>
                <span>{l.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('settings.theme')}
            </label>
            <div className="flex justify-center gap-2">
              {(['light', 'dark', 'system'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setThemeMode(mode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] flex items-center gap-1.5 ${
                    themeMode === mode
                      ? isDark
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : isDark
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span>{mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '💻'}</span>
                  <span>{t(`settings.${mode}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setScreen('generator')}
            className={`w-full py-4 rounded-2xl text-lg font-bold transition-all min-h-[56px] active:scale-95 ${
              isDark
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-300/50 hover:shadow-xl'
            }`}
          >
            {t('welcome.start')}
          </button>

          {/* Links */}
          <div className="flex justify-center gap-4 pt-2">
            <a
              href="https://ko-fi.com/noemimarcolini"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm flex items-center gap-1.5 transition-colors ${isDark ? 'text-amber-400/80 hover:text-amber-300' : 'text-amber-600 hover:text-amber-500'}`}
            >
              ☕ {lang === 'it' ? 'Supporta la creatrice' : 'Support the creator'}
            </a>
            <a
              href="https://gdr-sys-portfolio2026.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm flex items-center gap-1.5 transition-colors ${isDark ? 'text-indigo-400/80 hover:text-indigo-300' : 'text-indigo-500 hover:text-indigo-400'}`}
            >
              ⚔️ {lang === 'it' ? 'Altri tool GDR' : 'More GDR tools'}
            </a>
          </div>

          {/* About */}
          <button
            onClick={() => setShowAbout(true)}
            className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            {t('app.version')} — {t('about.title')}
          </button>
        </div>

        {/* About Modal */}
        {showAbout && (
          <BottomSheet onClose={() => setShowAbout(false)} isDark={isDark}>
            <h2 className="text-xl font-bold mb-4">{t('about.title')}</h2>
            <p className={`mb-4 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('about.description')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('about.credits')}
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all min-h-[48px] ${
                isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {t('about.close')}
            </button>
          </BottomSheet>
        )}
      </div>
    );
  }

  // Generator Screen
  return (
    <div className={`min-h-screen pb-safe transition-colors duration-300 ${isDark ? 'bg-[#0d0d1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-xl border-b pt-safe ${isDark ? 'bg-[#0d0d1a]/90 border-white/10' : 'bg-gray-50/90 border-gray-200'}`}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setScreen('welcome')}
            className={`text-sm font-medium min-h-[44px] min-w-[44px] flex items-center ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
          >
            {t('back.button')}
          </button>
          <h1 className="text-sm font-bold">{t('app.title')}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLang(lang === 'en' ? 'it' : 'en')}
              className={`text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
            >
              {lang === 'en' ? '🇬🇧' : '🇮🇹'} {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark')}
              className={`text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              title={t('settings.theme')}
            >
              {themeMode === 'dark' ? '🌙' : themeMode === 'light' ? '☀️' : '💻'}
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
            >
              📜
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Edition Toggle */}
        <div className="flex gap-2">
          {(['2014', '2024'] as const).map(ed => (
            <button
              key={ed}
              onClick={() => {
                setEdition(ed);
                if (ed === '2014' && treasureType === 'magicitem') setTreasureType('hoard');
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                edition === ed
                  ? isDark
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-indigo-500 text-white shadow-md'
                  : isDark
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {t(`edition.${ed}`)}
            </button>
          ))}
        </div>

        {/* Treasure Type */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('type.label')}
          </label>
          <div className="flex gap-2">
            {(['individual', 'hoard', ...(edition === '2024' ? ['magicitem'] : [])] as const).map(type => (
              <button
                key={type}
                onClick={() => setTreasureType(type as typeof treasureType)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                  treasureType === type
                    ? isDark
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : isDark
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {type === 'individual' ? '👤' : type === 'hoard' ? '💰' : '✨'}{' '}
                {t(`type.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* CR Tier Selector (for individual and hoard) - come da DMG */}
        {treasureType !== 'magicitem' && (
          <div className="space-y-2">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('cr.label')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CR_TIERS.map(tier => {
                const tierVal = tier.value.split('-')[0];
                const active = cr === tierVal;
                return (
                  <button
                    key={tier.value}
                    onClick={() => setCr(tierVal)}
                    className={`text-left p-3 rounded-xl transition-all min-h-[56px] ${
                      active
                        ? isDark
                          ? 'bg-indigo-600/20 border-2 border-indigo-500 text-white'
                          : 'bg-indigo-50 border-2 border-indigo-500 text-indigo-900'
                        : isDark
                          ? 'bg-white/5 border-2 border-transparent text-gray-300 hover:bg-white/10'
                          : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-base font-bold">{tier.label}</div>
                    <div className={`text-xs mt-0.5 ${active ? (isDark ? 'text-indigo-200' : 'text-indigo-700') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                      {tier.examples}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Theme & Rarity (2024 Magic Item by Theme) */}
        {edition === '2024' && treasureType === 'magicitem' && (
          <>
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('theme.label')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['random', 'Arcana', 'Armaments', 'Implements', 'Relics'].map(th => (
                  <button
                    key={th}
                    onClick={() => setTheme2024(th)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                      theme2024 === th
                        ? isDark
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : isDark
                          ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {t(`theme.${th.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('rarity.label')}
              </label>
              <div className="flex flex-wrap gap-2">
                {['common', 'uncommon', 'rare', 'very rare', 'legendary'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRarity2024(r)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] border ${
                      rarity2024 === r
                        ? RARITY_BG[r] || 'bg-white/15 border-white/20'
                        : isDark
                          ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                          : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                    } ${rarity2024 === r ? RARITY_COLORS[r] || '' : ''}`}
                  >
                    {t(`rarity.${r === 'very rare' ? 'veryrare' : r}`)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Roll Button */}
        <button
          onClick={roll}
          disabled={isRolling}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all min-h-[56px] active:scale-95 disabled:opacity-50 ${
            isDark
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-300/50'
          }`}
        >
          {isRolling ? (
            <span className="inline-block animate-diceRoll">🎲</span>
          ) : (
            result || singleItem ? t('roll.again') : t('roll.button')
          )}
        </button>

        {/* Results */}
        <div ref={resultRef}>
          {/* Single Magic Item Result (2024 by theme) */}
          {singleItem && !isRolling && (
            <div className={`rounded-2xl p-5 space-y-4 animate-fadeSlideUp ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <MagicItemCard item={singleItem} lang={lang} isDark={isDark} onSelect={setSelectedItem} t={t} />
            </div>
          )}

          {/* Full Treasure Result */}
          {result && !isRolling && (
            <div className="space-y-4 animate-fadeSlideUp">
              {/* Coins */}
              {result.coins.length > 0 && result.coins.some(c => c.amount > 0) && (
                <ResultSection title={t('result.coins')} icon="🪙" isDark={isDark}>
                  <div className="space-y-2">
                    {result.coins.filter(c => c.amount > 0).map((c, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <span className="flex items-center gap-2">
                          <span>{COIN_ICONS[c.type]}</span>
                          <span className="font-semibold text-sm">{t(c.type).toUpperCase()}</span>
                        </span>
                        <span className="font-bold text-lg tabular-nums">{formatNumber(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}

              {/* Gems */}
              {result.gems.length > 0 && (() => {
                const gemsTotal = result.gems.reduce((sum, g) => sum + g.value, 0);
                return (
                <ResultSection title={t('result.gems')} icon="💎" isDark={isDark}>
                  <div className="space-y-2">
                    {result.gems.map((g, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <span className="text-sm">{getGemName(g.name, g.value, lang)}</span>
                        <span className={`text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{formatNumber(g.value)} {t('gp')}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`flex items-center justify-between pt-3 mt-3 border-t text-sm font-bold ${isDark ? 'border-white/10 text-amber-300' : 'border-gray-200 text-amber-700'}`}>
                    <span>{t('result.total')}</span>
                    <span>{formatNumber(gemsTotal)} {t('gp')}</span>
                  </div>
                </ResultSection>
                );
              })()}

              {/* Art */}
              {result.art.length > 0 && (() => {
                const artTotal = result.art.reduce((sum, a) => sum + a.value, 0);
                return (
                <ResultSection title={t('result.art')} icon="🎨" isDark={isDark}>
                  <div className="space-y-2">
                    {result.art.map((a, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <span className="text-sm flex-1 mr-3">{getArtName(a.name, a.value, lang)}</span>
                        <span className={`text-sm font-semibold whitespace-nowrap ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{formatNumber(a.value)} {t('gp')}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`flex items-center justify-between pt-3 mt-3 border-t text-sm font-bold ${isDark ? 'border-white/10 text-amber-300' : 'border-gray-200 text-amber-700'}`}>
                    <span>{t('result.total')}</span>
                    <span>{formatNumber(artTotal)} {t('gp')}</span>
                  </div>
                </ResultSection>
                );
              })()}

              {/* Magic Items */}
              {result.magicItems.length > 0 && (
                <ResultSection title={t('result.magicitems')} icon="✨" isDark={isDark}>
                  <div className="space-y-2">
                    {result.magicItems.map((m, i) => (
                      <MagicItemCard key={i} item={m} lang={lang} isDark={isDark} onSelect={setSelectedItem} t={t} />
                    ))}
                  </div>
                </ResultSection>
              )}

              {/* No treasure */}
              {result.coins.every(c => c.amount === 0) && result.gems.length === 0 && result.art.length === 0 && result.magicItems.length === 0 && (
                <div className={`text-center py-8 rounded-2xl ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  <p className="text-4xl mb-2">🏜️</p>
                  <p>{t('result.notreasure')}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={copyResult}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                    isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {copied ? t('copy.success') : t('copy.button')}
                </button>
                {'share' in navigator && (
                  <button
                    onClick={shareResult}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                      isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {t('share.button')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Item Details Bottom Sheet */}
      {selectedItem && (
        <BottomSheet onClose={() => setSelectedItem(null)} isDark={isDark}>
          <ItemDetails name={selectedItem} lang={lang} isDark={isDark} t={t} />
        </BottomSheet>
      )}

      {/* History Bottom Sheet */}
      {showHistory && (
        <BottomSheet onClose={() => setShowHistory(false)} isDark={isDark}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t('history.title')}</h2>
            {history.length > 0 && (
              <button
                onClick={() => { setHistory([]); localStorage.removeItem('rollHistory'); }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                {t('history.clear')}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('history.empty')}</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-sm ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}
                  onClick={() => { setResult(h); setShowHistory(false); }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">
                      {h.edition} — CR {h.cr} — {h.type === 'individual' ? '👤' : '💰'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {h.coins.filter(c => c.amount > 0).map(c => `${formatNumber(c.amount)} ${c.type}`).join(', ')}
                    {h.magicItems.length > 0 && ` + ${h.magicItems.length} ✨`}
                    {h.gems.length > 0 && ` + ${h.gems.length} 💎`}
                    {h.art.length > 0 && ` + ${h.art.length} 🎨`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

// === Sub-Components ===

function ResultSection({ title, icon, isDark, children }: {
  title: string; icon: string; isDark: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

function MagicItemCard({ item, lang, isDark, onSelect, t }: {
  item: MagicItemResult; lang: Lang; isDark: boolean; onSelect: (name: string) => void; t: (k: string) => string;
}) {
  const data = getMagicItemData(item.name);
  const rarity = data?.rarity || 'unknown';
  const rarityColor = RARITY_COLORS[rarity] || (isDark ? 'text-gray-400' : 'text-gray-500');
  const rarityLabel = rarity !== 'unknown' ? t(`rarity.${rarity === 'very rare' ? 'veryrare' : rarity}`) : '';

  return (
    <button
      onClick={() => onSelect(item.name)}
      className={`w-full text-left p-3 rounded-xl transition-all min-h-[56px] ${
        isDark ? 'bg-white/5 hover:bg-white/10 border border-white/5' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{getItemName(item.name, lang)}</p>
          {rarityLabel && (
            <p className={`text-xs mt-0.5 ${rarityColor}`}>{rarityLabel}</p>
          )}
        </div>
        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>ℹ️</span>
      </div>
    </button>
  );
}

function ItemDetails({ name, lang, isDark, t }: {
  name: string; lang: Lang; isDark: boolean; t: (k: string) => string;
}) {
  const data = getMagicItemData(name);
  const displayName = getItemName(name, lang);
  const description = getItemDescription(name, lang);
  const rarity = data?.rarity || '';
  const rarityColor = RARITY_COLORS[rarity] || '';
  const rarityLabel = rarity ? t(`rarity.${rarity === 'very rare' ? 'veryrare' : rarity}`) : '';

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{displayName}</h2>
      {rarityLabel && (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${RARITY_BG[rarity] || ''} ${rarityColor}`}>
          {rarityLabel}
        </span>
      )}
      <div>
        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('item.description')}
        </h3>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
      {lang === 'it' && data && (
        <div className={`text-xs italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          EN: {data.nameEN}
        </div>
      )}
    </div>
  );
}

function BottomSheet({ onClose, isDark, children }: {
  onClose: () => void; isDark: boolean; children: React.ReactNode;
}) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Backdrop - top area */}
      <div className="flex-1 bg-black/60 animate-fadeIn" />

      {/* Sheet at bottom */}
      <div
        className={`w-full max-w-lg mx-auto rounded-t-3xl p-6 overflow-y-auto animate-slideUp ${
          isDark ? 'bg-[#1a1a2e]' : 'bg-white'
        }`}
        style={{
          maxHeight: '80vh',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className={`w-10 h-1 rounded-full mx-auto mb-4 ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
        {children}
      </div>
    </div>
  );
}
