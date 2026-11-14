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

// Dentro Pocket GM Screen l'app arriva con ?incorporato=1&tema=...&colore=...&lang=...
const PARAMS = new URLSearchParams(window.location.search);
const EMBEDDED = PARAMS.has('incorporato');
const PALETTE = PARAMS.get('colore');
const PARAM_THEME = PARAMS.get('tema');
const PARAM_LANG = PARAMS.get('lang');

// CR fasce raggruppate come da DMG (0-4, 5-10, 11-16, 17+)
const CR_TIERS = [
  { value: '0-4', label: 'GS 0–4', labelEN: 'CR 0–4', examples: 'Mostri deboli: coboldi, goblin', examplesEN: 'Weak monsters: kobolds, goblins' },
  { value: '5-10', label: 'GS 5–10', labelEN: 'CR 5–10', examples: 'Avversari seri: orchi, hobgoblin', examplesEN: 'Serious foes: ogres, hobgoblins' },
  { value: '11-16', label: 'GS 11–16', labelEN: 'CR 11–16', examples: 'Minacce epiche: giganti, lich', examplesEN: 'Epic threats: giants, liches' },
  { value: '17+', label: 'GS 17+', labelEN: 'CR 17+', examples: 'Leggende: draghi antichi', examplesEN: 'Legends: ancient dragons' },
];

const rarityClass = (r: string) => (r ? 'rar-' + r.replace(' ', '') : '');

function formatNumber(n: number): string {
  return n.toLocaleString();
}

// ── Icone (tratto, colore dal testo) ──
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICONS = {
  dado: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8.5 8.5h.01M15.5 15.5h.01M15.5 8.5h.01M8.5 15.5h.01M12 12h.01',
  monete: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3ZM4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  gemma: 'M6 3h12l4 6-10 12L2 9l4-6ZM2 9h20M12 21 8 9l4-6 4 6-4 12',
  arte: 'M4 4h16v16H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01',
  magia: 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M12.2 6.2 11 5M3 21l9-9',
  storia: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  luna: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  sole: 'M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6 19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4 19 5M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  sistema: 'M3 4h18v12H3zM8 20h8M12 16v4',
  indietro: 'M15 18l-6-6 6-6',
  info: 'M12 16v-4M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  persona: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  scrigno: 'M3 10h18v10H3zM3 10l2-5h14l2 5M11 13h2v3h-2z',
  copia: 'M9 9h11v11H9zM5 15H4V4h11v1',
  condividi: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>(EMBEDDED ? 'generator' : 'welcome');
  const [lang, setLang] = useState<Lang>(() => {
    if (PARAM_LANG === 'it' || PARAM_LANG === 'en') return PARAM_LANG;
    const saved = localStorage.getItem('lang');
    return (saved === 'it' || saved === 'en') ? saved : 'it';
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (PARAM_THEME === 'dark' || PARAM_THEME === 'light') return PARAM_THEME;
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

  useEffect(() => {
    if (!PARAM_LANG) localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (PALETTE) document.documentElement.dataset.colore = PALETTE;
  }, []);

  useEffect(() => {
    if (!PARAM_THEME) localStorage.setItem('themeMode', themeMode);
    const root = document.documentElement;
    const dark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', dark);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('rollHistory', JSON.stringify(history.slice(0, 50)));
  }, [history]);

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
        newResult = treasureType === 'individual' ? generateIndividual2014(cr) : generateHoard2014(cr);
      } else {
        newResult = treasureType === 'individual' ? generateIndividual2024(cr) : generateHoard2024(cr);
      }

      if (newResult) {
        setResult(newResult);
        setHistory(prev => [newResult!, ...prev].slice(0, 50));
      }
      setIsRolling(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 500);
  }, [edition, treasureType, cr, theme2024, rarity2024]);

  const resultText = useCallback((): string => {
    let text = '';
    if (singleItem) {
      text = `${getItemName(singleItem.name, lang)}\n${getItemDescription(singleItem.name, lang)}`;
    } else if (result) {
      const tipo = result.type === 'individual' ? t('type.individual') : t('type.hoard');
      text = `${t('app.title')} (DMG ${result.edition}) · ${lang === 'it' ? 'GS' : 'CR'} ${result.cr} · ${tipo}\n\n`;
      if (result.coins.some(c => c.amount > 0)) {
        text += t('result.coins') + ':\n';
        result.coins.filter(c => c.amount > 0).forEach(c => { text += `  ${formatNumber(c.amount)} ${t(c.type)}\n`; });
      }
      if (result.gems.length > 0) {
        text += `\n${t('result.gems')}:\n`;
        result.gems.forEach(g => { text += `  ${getGemName(g.name, g.value, lang)} (${formatNumber(g.value)} ${t('gp')})\n`; });
      }
      if (result.art.length > 0) {
        text += `\n${t('result.art')}:\n`;
        result.art.forEach(a => { text += `  ${getArtName(a.name, a.value, lang)} (${formatNumber(a.value)} ${t('gp')})\n`; });
      }
      if (result.magicItems.length > 0) {
        text += `\n${t('result.magicitems')}:\n`;
        result.magicItems.forEach(m => { text += `  ${getItemName(m.name, lang)}\n`; });
      }
    }
    return text;
  }, [result, singleItem, lang, t]);

  const copyResult = useCallback(() => {
    const text = resultText();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [resultText]);

  const shareResult = useCallback(() => {
    if (!navigator.share) return;
    navigator.share({ title: t('app.title'), text: resultText() }).catch(() => {});
  }, [resultText, t]);

  const nextTheme: ThemeMode = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark';
  const themeIcon = themeMode === 'dark' ? ICONS.luna : themeMode === 'light' ? ICONS.sole : ICONS.sistema;

  // ── Benvenuto ──
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div className="space-y-3">
            <span className="accento-testo inline-flex"><Icon d={ICONS.scrigno} size={44} /></span>
            <h1 className="titolo text-5xl">{t('app.title')}</h1>
            <p className="quieto text-base">{t('app.subtitle')}</p>
          </div>

          <div className="space-y-2">
            <div className="etichetta">{t('edition.label')}</div>
            <div className="grid grid-cols-2 gap-2">
              {(['2014', '2024'] as const).map(ed => (
                <button key={ed} onClick={() => setEdition(ed)} aria-pressed={edition === ed} className="scelta p-4 min-h-[64px]">
                  <span className="titolo text-2xl">{t(`edition.${ed}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="etichetta">{lang === 'it' ? 'Lingua' : 'Language'}</div>
              <div className="flex gap-2">
                {(['it', 'en'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className="scelta flex-1 px-3 min-h-[48px] text-center font-semibold">
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="etichetta">{t('settings.theme')}</div>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map(mode => (
                  <button key={mode} onClick={() => setThemeMode(mode)} aria-pressed={themeMode === mode} title={t(`settings.${mode}`)} aria-label={t(`settings.${mode}`)} className="scelta flex-1 min-h-[48px] flex items-center justify-center">
                    <Icon d={mode === 'light' ? ICONS.sole : mode === 'dark' ? ICONS.luna : ICONS.sistema} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => setScreen('generator')} className="bott bott-pieno w-full text-lg min-h-[56px]">
            {t('welcome.start')}
          </button>

          <div className="flex flex-wrap justify-between gap-3 text-sm">
            <a href="https://pocketgmscreen.pages.dev/" target="_blank" rel="noopener noreferrer" className="accento-testo font-semibold">
              {lang === 'it' ? 'Prova Pocket GM Screen' : 'Try Pocket GM Screen'}
            </a>
            <a href="https://ko-fi.com/noemimarcolini" target="_blank" rel="noopener noreferrer" className="quieto">
              {lang === 'it' ? 'Supporta la creatrice' : 'Support the creator'}
            </a>
            <button onClick={() => setShowAbout(true)} className="quieto">
              {t('app.version')} · {t('about.title')}
            </button>
          </div>
        </div>

        {showAbout && (
          <BottomSheet onClose={() => setShowAbout(false)}>
            <h2 className="titolo text-3xl mb-3">{t('about.title')}</h2>
            <p className="mb-3 leading-relaxed">{t('about.description')}</p>
            <p className="quieto text-sm">{t('about.credits')}</p>
            <button onClick={() => setShowAbout(false)} className="bott bott-tenue w-full mt-6">{t('about.close')}</button>
          </BottomSheet>
        )}
      </div>
    );
  }

  // ── Generatore ──
  return (
    <div className="min-h-screen pb-safe">
      <header className="testata sticky top-0 z-30 backdrop-blur-xl pt-safe">
        <div className="max-w-xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
          {EMBEDDED ? (
            <h1 className="titolo text-xl">{t('app.title')}</h1>
          ) : (
            <button onClick={() => setScreen('welcome')} className="bott-icona accento-testo" aria-label={t('back.button')}>
              <Icon d={ICONS.indietro} /> {t('back.button')}
            </button>
          )}
          {!EMBEDDED && <h1 className="titolo text-lg hidden sm:block">{t('app.title')}</h1>}
          <div className="flex items-center gap-1">
            <button onClick={() => setLang(lang === 'en' ? 'it' : 'en')} className="bott-icona" aria-label={lang === 'it' ? 'Cambia lingua' : 'Change language'}>
              {lang.toUpperCase()}
            </button>
            {!PARAM_THEME && (
              <button onClick={() => setThemeMode(nextTheme)} className="bott-icona" title={t('settings.theme')} aria-label={t('settings.theme')}>
                <Icon d={themeIcon} />
              </button>
            )}
            <button onClick={() => setShowHistory(true)} className="bott-icona" title={t('history.title')} aria-label={t('history.title')}>
              <Icon d={ICONS.storia} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Edizione */}
        <div className="grid grid-cols-2 gap-2">
          {(['2014', '2024'] as const).map(ed => (
            <button
              key={ed}
              onClick={() => { setEdition(ed); if (ed === '2014' && treasureType === 'magicitem') setTreasureType('hoard'); }}
              aria-pressed={edition === ed}
              className="scelta px-4 min-h-[52px] text-center"
            >
              <span className="titolo text-xl">{t(`edition.${ed}`)}</span>
            </button>
          ))}
        </div>

        {/* Tipo di tesoro */}
        <div className="space-y-2">
          <div className="etichetta">{t('type.label')}</div>
          <div className={`grid gap-2 ${edition === '2024' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {(['individual', 'hoard', ...(edition === '2024' ? ['magicitem'] : [])] as const).map(type => (
              <button
                key={type}
                onClick={() => setTreasureType(type as typeof treasureType)}
                aria-pressed={treasureType === type}
                className="scelta p-3 min-h-[72px] flex flex-col items-start justify-between gap-1"
              >
                <span className="accento-testo"><Icon d={type === 'individual' ? ICONS.persona : type === 'hoard' ? ICONS.scrigno : ICONS.magia} /></span>
                <span className="text-sm font-semibold leading-tight">{t(`type.${type}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grado di sfida */}
        {treasureType !== 'magicitem' && (
          <div className="space-y-2">
            <div className="etichetta">{t('cr.label')}</div>
            <div className="grid grid-cols-2 gap-2">
              {CR_TIERS.map(tier => {
                const tierVal = tier.value.split('-')[0].replace('+', '');
                const active = cr === tierVal;
                return (
                  <button key={tier.value} onClick={() => setCr(tierVal)} aria-pressed={active} className="scelta p-3 min-h-[64px]">
                    <div className="titolo text-xl">{lang === 'it' ? tier.label : tier.labelEN}</div>
                    <div className="quieto text-xs mt-1">{lang === 'it' ? tier.examples : tier.examplesEN}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tema e rarità (oggetto per tema, 2024) */}
        {edition === '2024' && treasureType === 'magicitem' && (
          <>
            <div className="space-y-2">
              <div className="etichetta">{t('theme.label')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['random', 'Arcana', 'Armaments', 'Implements', 'Relics'].map(th => (
                  <button key={th} onClick={() => setTheme2024(th)} aria-pressed={theme2024 === th} className="scelta px-3 min-h-[48px] text-sm font-semibold">
                    {t(`theme.${th.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="etichetta">{t('rarity.label')}</div>
              <div className="flex flex-wrap gap-2">
                {['common', 'uncommon', 'rare', 'very rare', 'legendary'].map(r => (
                  <button key={r} onClick={() => setRarity2024(r)} aria-pressed={rarity2024 === r} className={`scelta rar-scelta ${rarityClass(r)} px-4 min-h-[44px] text-sm font-semibold`}>
                    {t(`rarity.${r === 'very rare' ? 'veryrare' : r}`)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tiro */}
        <button onClick={roll} disabled={isRolling} className="bott bott-pieno w-full text-lg min-h-[56px]">
          {isRolling ? <span className="animate-tiro"><Icon d={ICONS.dado} size={24} /></span> : <><Icon d={ICONS.dado} /> {result || singleItem ? t('roll.again') : t('roll.button')}</>}
        </button>

        {/* Risultati */}
        <div ref={resultRef} className="scroll-mt-20">
          {singleItem && !isRolling && (
            <div className="animate-fadeSlideUp space-y-3">
              <MagicItemCard item={singleItem} lang={lang} onSelect={setSelectedItem} t={t} />
              <Actions copied={copied} onCopy={copyResult} onShare={shareResult} t={t} />
            </div>
          )}

          {result && !isRolling && (
            <div className="space-y-4 animate-fadeSlideUp">
              {result.coins.some(c => c.amount > 0) && (
                <ResultSection title={t('result.coins')} icon={ICONS.monete}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.coins.filter(c => c.amount > 0).map((c, i) => (
                      <div key={i} className="campo px-3 py-2">
                        <div className="titolo text-2xl tabular-nums">{formatNumber(c.amount)}</div>
                        <div className="quieto text-xs font-semibold uppercase tracking-wide">{t(c.type)}</div>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.gems.length > 0 && (
                <ResultSection title={t('result.gems')} icon={ICONS.gemma} total={result.gems.reduce((s, g) => s + g.value, 0)} t={t}>
                  {result.gems.map((g, i) => (
                    <Row key={i} name={getGemName(g.name, g.value, lang)} value={`${formatNumber(g.value)} ${t('gp')}`} />
                  ))}
                </ResultSection>
              )}

              {result.art.length > 0 && (
                <ResultSection title={t('result.art')} icon={ICONS.arte} total={result.art.reduce((s, a) => s + a.value, 0)} t={t}>
                  {result.art.map((a, i) => (
                    <Row key={i} name={getArtName(a.name, a.value, lang)} value={`${formatNumber(a.value)} ${t('gp')}`} />
                  ))}
                </ResultSection>
              )}

              {result.magicItems.length > 0 && (
                <ResultSection title={t('result.magicitems')} icon={ICONS.magia}>
                  <div className="space-y-2">
                    {result.magicItems.map((m, i) => (
                      <MagicItemCard key={i} item={m} lang={lang} onSelect={setSelectedItem} t={t} />
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.coins.every(c => c.amount === 0) && result.gems.length === 0 && result.art.length === 0 && result.magicItems.length === 0 && (
                <div className="tessera text-center py-8 quieto">{t('result.notreasure')}</div>
              )}

              <Actions copied={copied} onCopy={copyResult} onShare={shareResult} t={t} />
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <BottomSheet onClose={() => setSelectedItem(null)}>
          <ItemDetails name={selectedItem} lang={lang} t={t} />
        </BottomSheet>
      )}

      {showHistory && (
        <BottomSheet onClose={() => setShowHistory(false)}>
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="titolo text-3xl">{t('history.title')}</h2>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); localStorage.removeItem('rollHistory'); }} className="bott-icona quieto">
                {t('history.clear')}
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="quieto text-center py-8">{t('history.empty')}</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((h, i) => (
                <button key={i} className="scelta w-full p-3 text-sm" onClick={() => { setResult(h); setSingleItem(null); setShowHistory(false); }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold">
                      DMG {h.edition} · {lang === 'it' ? 'GS' : 'CR'} {h.cr} · {h.type === 'individual' ? t('type.individual') : t('type.hoard')}
                    </span>
                    <span className="quieto text-xs">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="quieto text-xs">
                    {h.coins.filter(c => c.amount > 0).map(c => `${formatNumber(c.amount)} ${t(c.type)}`).join(', ')}
                    {h.magicItems.length > 0 && ` · ${h.magicItems.length} ${t('result.magicitems').toLowerCase()}`}
                    {h.gems.length > 0 && ` · ${h.gems.length} ${t('result.gems').toLowerCase()}`}
                    {h.art.length > 0 && ` · ${h.art.length} ${t('result.art').toLowerCase()}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

// ── Componenti ──

function ResultSection({ title, icon, total, t, children }: {
  title: string; icon: string; total?: number; t?: (k: string) => string; children: React.ReactNode;
}) {
  return (
    <section className="tessera p-4 space-y-3">
      <h3 className="flex items-center gap-2">
        <span className="accento-testo"><Icon d={icon} /></span>
        <span className="titolo text-2xl">{title}</span>
      </h3>
      <div className="space-y-2">{children}</div>
      {total !== undefined && t && (
        <div className="flex items-center justify-between pt-3 border-t filo text-sm font-semibold">
          <span>{t('result.total')}</span>
          <span className="oro tabular-nums">{formatNumber(total)} {t('gp')}</span>
        </div>
      )}
    </section>
  );
}

function Row({ name, value }: { name: string; value: string }) {
  return (
    <div className="campo flex items-center justify-between gap-3 px-3 py-2">
      <span className="text-sm flex-1 min-w-0">{name}</span>
      <span className="oro text-sm font-semibold whitespace-nowrap tabular-nums">{value}</span>
    </div>
  );
}

function Actions({ copied, onCopy, onShare, t }: { copied: boolean; onCopy: () => void; onShare: () => void; t: (k: string) => string }) {
  return (
    <div className="flex gap-2">
      <button onClick={onCopy} className="bott bott-tenue flex-1"><Icon d={ICONS.copia} size={18} /> {copied ? t('copy.success') : t('copy.button')}</button>
      {'share' in navigator && (
        <button onClick={onShare} className="bott bott-tenue flex-1"><Icon d={ICONS.condividi} size={18} /> {t('share.button')}</button>
      )}
    </div>
  );
}

function MagicItemCard({ item, lang, onSelect, t }: {
  item: MagicItemResult; lang: Lang; onSelect: (name: string) => void; t: (k: string) => string;
}) {
  const data = getMagicItemData(item.name);
  const rarity = data?.rarity || '';
  const rarityLabel = rarity ? t(`rarity.${rarity === 'very rare' ? 'veryrare' : rarity}`) : '';
  return (
    <button onClick={() => onSelect(item.name)} className={`campo w-full text-left px-3 py-3 min-h-[56px] flex items-center justify-between gap-3 ${rarityClass(rarity)}`}>
      <span className="min-w-0">
        <span className="block font-semibold">{getItemName(item.name, lang)}</span>
        {rarityLabel && <span className="rar-testo block text-xs font-semibold mt-0.5">{rarityLabel}</span>}
      </span>
      <span className="quieto"><Icon d={ICONS.info} size={18} /></span>
    </button>
  );
}

function ItemDetails({ name, lang, t }: { name: string; lang: Lang; t: (k: string) => string }) {
  const data = getMagicItemData(name);
  const rarity = data?.rarity || '';
  const rarityLabel = rarity ? t(`rarity.${rarity === 'very rare' ? 'veryrare' : rarity}`) : '';
  return (
    <div className="space-y-4">
      <h2 className="titolo text-3xl">{getItemName(name, lang)}</h2>
      {rarityLabel && <span className={`rar-pillola ${rarityClass(rarity)} inline-block px-3 py-1 text-xs font-semibold`}>{rarityLabel}</span>}
      <div>
        <div className="etichetta mb-2">{t('item.description')}</div>
        <p className="leading-relaxed">{getItemDescription(name, lang)}</p>
      </div>
      {lang === 'it' && data && <div className="quieto text-xs italic">EN: {data.nameEN}</div>}
    </div>
  );
}

function BottomSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = original; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 velo animate-fadeIn" />
      <div
        className="foglio w-full max-w-xl mx-auto rounded-t-[28px] p-6 overflow-y-auto animate-slideUp"
        style={{ maxHeight: '82vh', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--filo)' }} />
        {children}
      </div>
    </div>
  );
}
