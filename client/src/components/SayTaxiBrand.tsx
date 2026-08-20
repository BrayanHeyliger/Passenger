type SayTaxiBrandProps = { compact?: boolean; className?: string };

export function SayTaxiBrand({ compact = false, className = "" }: SayTaxiBrandProps) {
  return <span className={`inline-flex items-center gap-3 ${className}`}><img src="/saytaxi-mark.svg" alt="" className="h-9 w-9" /><span className="leading-none"><strong className="block text-white font-extrabold tracking-tight">Say<span className="text-[oklch(0.76_0.18_148)]">Taxi</span></strong>{!compact && <small className="block mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Mobility Platform</small>}</span></span>;
}
