import { useState, useRef, useEffect } from "react";
import { useI18n, LANGUAGES, Lang } from "@/contexts/I18nContext";

// SVG flag components (inline, no external dependencies)
const FlagES = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-4 rounded-sm flex-shrink-0">
    <rect width="20" height="15" fill="#c60b1e"/>
    <rect y="3.75" width="20" height="7.5" fill="#ffc400"/>
  </svg>
);

const FlagUS = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-4 rounded-sm flex-shrink-0">
    <rect width="20" height="15" fill="#B22234"/>
    <rect y="1.15" width="20" height="1.15" fill="white"/>
    <rect y="3.46" width="20" height="1.15" fill="white"/>
    <rect y="5.77" width="20" height="1.15" fill="white"/>
    <rect y="8.08" width="20" height="1.15" fill="white"/>
    <rect y="10.38" width="20" height="1.15" fill="white"/>
    <rect y="12.69" width="20" height="1.15" fill="white"/>
    <rect width="8" height="8.08" fill="#3C3B6E"/>
  </svg>
);

const FlagFR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-4 rounded-sm flex-shrink-0">
    <rect width="20" height="15" fill="#ED2939"/>
    <rect width="13.33" height="15" fill="white"/>
    <rect width="6.67" height="15" fill="#002395"/>
  </svg>
);

const FlagComponents: Record<string, React.FC> = {
  es: FlagES,
  en: FlagUS,
  fr: FlagFR,
};

export function LanguageSelector() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang)!;
  const CurrentFlag = FlagComponents[lang] || FlagES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium text-white"
        title="Cambiar idioma"
      >
        <CurrentFlag />
        <span className="hidden sm:inline text-xs">{current.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 min-w-[160px]">
          {LANGUAGES.map(l => {
            const Flag = FlagComponents[l.code] || FlagES;
            return (
              <button
                key={l.code}
                onClick={() => { setLang(l.code as Lang); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${lang === l.code ? "bg-green-50 text-green-700 font-semibold" : "text-slate-700"}`}
              >
                <Flag />
                <span>{l.label}</span>
                {lang === l.code && <span className="ml-auto text-green-500 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Versión para fondos claros (panel admin)
export function LanguageSelectorLight() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang)!;
  const CurrentFlag = FlagComponents[lang] || FlagES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
        title="Cambiar idioma"
      >
        <CurrentFlag />
        <span className="text-xs">{current.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 min-w-[160px]">
          {LANGUAGES.map(l => {
            const Flag = FlagComponents[l.code] || FlagES;
            return (
              <button
                key={l.code}
                onClick={() => { setLang(l.code as Lang); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors ${lang === l.code ? "bg-green-50 text-green-700 font-semibold" : "text-slate-700"}`}
              >
                <Flag />
                <span>{l.label}</span>
                {lang === l.code && <span className="ml-auto text-green-500 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
