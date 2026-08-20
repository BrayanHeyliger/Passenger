import { CheckCircle2, Clock3, MapPinned, Radio, Route } from "lucide-react";

type Props = { isOnline: boolean; tripPhase: "idle" | "accepted" | "otp_verify" | "in_progress" | "completed" | "rating"; completedCount: number; earnings: number; };

export function DriverActivityTimeline({ isOnline, tripPhase, completedCount, earnings }: Props) {
  const tripActive = ["accepted", "otp_verify", "in_progress"].includes(tripPhase);
  const rows = [
    { icon: Radio, title: isOnline ? "Disponible para solicitudes" : "Modo desconectado", detail: isOnline ? "La app escucha viajes cercanos" : "Conéctate para recibir viajes", on: isOnline },
    { icon: Route, title: tripActive ? "Ruta activa" : "Sin viaje activo", detail: tripActive ? "Ubicación y estado actualizados" : "El siguiente viaje aparecerá aquí", on: tripActive },
    { icon: CheckCircle2, title: `${completedCount} viajes completados hoy`, detail: `Ganancias visibles: $${earnings.toFixed(2)}`, on: completedCount > 0 },
  ];
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Actividad de hoy</p><h3 className="mt-1 font-bold text-slate-900">Tu jornada, en un vistazo</h3></div><Clock3 size={18} className="text-green-600" /></div><div className="space-y-4">{rows.map(({ icon: Icon, title, detail, on }, index) => <div key={title} className="relative flex gap-3"><div className="flex flex-col items-center"><span className={`grid h-7 w-7 place-items-center rounded-full ${on ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}><Icon size={14} /></span>{index < rows.length - 1 && <span className="mt-1 h-6 w-px bg-slate-200" />}</div><div className="pb-1"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-0.5 text-xs text-slate-500">{detail}</p></div></div>)}</div><div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><MapPinned size={14} className="text-green-600" /> Los cambios del viaje se reflejarán aquí mientras conduces.</div></div>;
}
