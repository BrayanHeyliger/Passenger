import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Info, AlertTriangle, CheckCircle, AlertOctagon, Megaphone } from "lucide-react";

type Target = "clients" | "drivers" | "fleet";

interface Props {
  target: Target;
}

const typeConfig = {
  info:    { icon: Info,          bg: "bg-blue-50 border-blue-200",    text: "text-blue-800",   iconColor: "text-blue-500",   label: "Información" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200",  text: "text-amber-800",  iconColor: "text-amber-500",  label: "Aviso" },
  success: { icon: CheckCircle,   bg: "bg-green-50 border-green-200",  text: "text-green-800",  iconColor: "text-green-500",  label: "Novedad" },
  urgent:  { icon: AlertOctagon,  bg: "bg-red-50 border-red-200",      text: "text-red-800",    iconColor: "text-red-500",    label: "Urgente" },
};

export default function AnnouncementBanner({ target }: Props) {
  const [dismissed, setDismissed] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`wt_dismissed_${target}`) || "[]");
    } catch { return []; }
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: announcements = [] } = trpc.announcements.getActive.useQuery(
    { target },
    { refetchInterval: 30000 } // Poll every 30 seconds for new announcements
  );

  const visible = announcements.filter((a: any) => !dismissed.includes(a.id));

  const dismiss = (id: number) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(`wt_dismissed_${target}`, JSON.stringify(next));
    setCurrentIndex(0);
  };

  const dismissAll = () => {
    const allIds = visible.map((a: any) => a.id);
    const next = [...dismissed, ...allIds];
    setDismissed(next);
    localStorage.setItem(`wt_dismissed_${target}`, JSON.stringify(next));
  };

  // Auto-advance carousel every 8 seconds if multiple announcements
  useEffect(() => {
    if (visible.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % visible.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [visible.length]);

  if (visible.length === 0) return null;

  const ann = visible[currentIndex] || visible[0];
  const cfg = typeConfig[ann.type as keyof typeof typeConfig] || typeConfig.info;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} relative overflow-hidden`}>
      {/* Pinned indicator */}
      {ann.pinned && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-t-[24px] border-t-current opacity-20" />
      )}

      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${cfg.iconColor}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold uppercase tracking-widest ${cfg.iconColor}`}>{cfg.label}</span>
            {visible.length > 1 && (
              <span className={`text-xs ${cfg.text} opacity-60`}>{currentIndex + 1}/{visible.length}</span>
            )}
          </div>
          <p className={`font-semibold text-sm ${cfg.text}`}>{ann.title}</p>
          <p className={`text-xs mt-0.5 leading-relaxed ${cfg.text} opacity-80`}>{ann.message}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {visible.length > 1 && (
            <button onClick={() => setCurrentIndex(i => (i + 1) % visible.length)}
              className={`text-xs px-2 py-1 rounded-lg ${cfg.text} opacity-60 hover:opacity-100 transition-opacity`}>
              →
            </button>
          )}
          <button onClick={() => dismiss(ann.id)}
            className={`p-1 rounded-lg ${cfg.text} opacity-50 hover:opacity-100 transition-opacity`}
            title="Cerrar este anuncio">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Dots indicator for multiple announcements */}
      {visible.length > 1 && (
        <div className="flex gap-1 mt-2 justify-center">
          {visible.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? `${cfg.iconColor} opacity-100 w-3` : `${cfg.iconColor} opacity-30`}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// Compact floating version for panels with limited space
export function AnnouncementToast({ target }: Props) {
  const [dismissed, setDismissed] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`wt_dismissed_toast_${target}`) || "[]");
    } catch { return []; }
  });
  const [expanded, setExpanded] = useState(false);

  const { data: announcements = [] } = trpc.announcements.getActive.useQuery(
    { target },
    { refetchInterval: 30000 }
  );

  const visible = announcements.filter((a: any) => !dismissed.includes(a.id));

  const dismiss = (id: number) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(`wt_dismissed_toast_${target}`, JSON.stringify(next));
  };

  if (visible.length === 0) return null;

  const urgent = visible.find((a: any) => a.type === "urgent");
  const ann = urgent || visible[0];
  const cfg = typeConfig[ann.type as keyof typeof typeConfig] || typeConfig.info;

  return (
    <div className={`rounded-xl border p-3 ${cfg.bg} cursor-pointer`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center gap-2">
        <Megaphone size={14} className={cfg.iconColor} />
        <p className={`text-xs font-semibold flex-1 truncate ${cfg.text}`}>{ann.title}</p>
        {visible.length > 1 && <span className={`text-xs ${cfg.text} opacity-60 flex-shrink-0`}>{visible.length} anuncios</span>}
        <button onClick={e => { e.stopPropagation(); dismiss(ann.id); }} className={`${cfg.text} opacity-50 hover:opacity-100`}><X size={12} /></button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          {visible.map((a: any) => {
            const c = typeConfig[a.type as keyof typeof typeConfig] || typeConfig.info;
            return (
              <div key={a.id} className="flex items-start gap-2 pt-2 border-t border-current/10">
                <p className={`text-xs flex-1 ${c.text}`}><strong>{a.title}:</strong> {a.message}</p>
                <button onClick={e => { e.stopPropagation(); dismiss(a.id); }} className={`${c.text} opacity-50 hover:opacity-100 flex-shrink-0`}><X size={10} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
