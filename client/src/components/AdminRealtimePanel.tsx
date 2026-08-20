import { Activity, LockKeyhole, Radio, Server } from "lucide-react";
import { useEffect, useState } from "react";

type Health = "checking" | "online" | "offline" | "unconfigured";

export default function AdminRealtimePanel() {
  const endpoint = import.meta.env.VITE_REALTIME_URL as string | undefined;
  const [health, setHealth] = useState<Health>(endpoint ? "checking" : "unconfigured");

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();
    fetch(`${endpoint.replace(/\/$/, "")}/health`, { signal: controller.signal })
      .then(response => setHealth(response.ok ? "online" : "offline"))
      .catch(() => setHealth("offline"));
    return () => controller.abort();
  }, [endpoint]);

  const state = { checking: ["Comprobando conexión", "text-amber-300", "bg-amber-400"], online: ["Servicio conectado", "text-emerald-300", "bg-emerald-400"], offline: ["Servicio no disponible", "text-rose-300", "bg-rose-400"], unconfigured: ["URL de tiempo real pendiente", "text-slate-300", "bg-slate-400"] }[health];
  return <div className="rounded-3xl border border-white/10 bg-[#0a1514] p-6 text-white shadow-2xl"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-extrabold tracking-[.18em] text-emerald-300">SAYTAXI REALTIME</p><h2 className="mt-2 text-3xl font-bold">Operación en vivo</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Monitor de conectividad para GPS, salas de viaje, chat y presencia. Solo muestra información verificada por el servicio configurado.</p></div><span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm ${state[1]}`}><i className={`h-2.5 w-2.5 rounded-full ${state[2]} ${health === "checking" ? "animate-pulse" : ""}`} />{state[0]}</span></div><div className="mt-7 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><Radio className="text-emerald-300" size={20}/><h3 className="mt-4 font-semibold">GPS y rutas</h3><p className="mt-1 text-sm text-white/50">Seguimiento por sala de viaje cuando el endpoint esté activo.</p></article><article className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><Activity className="text-cyan-300" size={20}/><h3 className="mt-4 font-semibold">Chat y presencia</h3><p className="mt-1 text-sm text-white/50">Estado de conexiones protegido por token y rol.</p></article><article className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><LockKeyhole className="text-violet-300" size={20}/><h3 className="mt-4 font-semibold">Configuración</h3><p className="mt-1 text-sm text-white/50">{endpoint ? "Endpoint configurado para verificación." : "Define VITE_REALTIME_URL al publicar el servicio persistente."}</p></article></div><div className="mt-5 flex items-center gap-2 text-xs text-white/35"><Server size={14}/>No se generan métricas de ejemplo en esta vista.</div></div>;
}
