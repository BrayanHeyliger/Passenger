type SayTaxiBrandProps = { compact?: boolean; className?: string };

export function SayTaxiBrand({ compact = false, className = "" }: SayTaxiBrandProps) {
  return <span aria-label="UnPasajero.Com" className={`inline-flex items-center gap-3 ${className}`}><span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#5df0b4_0%,#1a9d68_48%,#084b36_100%)] text-base font-black text-white shadow-[0_0_22px_rgba(50,224,151,0.35)]">P</span><span className="leading-none"><strong className="block text-white font-extrabold tracking-tight">Un<span className="text-[oklch(0.76_0.18_148)]">Pasajero</span><span className="text-white/70">.Com</span></strong>{!compact && <small className="block mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Orlando Mobility</small>}</span></span>;
}
