import { useState } from "react";
import { BarChart3, CarFront, CheckCircle2, ChevronRight, MapPinned, Send, UsersRound } from "lucide-react";

const scenes = [
  { id: "request", label: "Solicitud", icon: Send, title: "Una solicitud entra y se organiza en segundos.", text: "La operación recibe el contexto del viaje para decidir y actuar desde una misma vista.", metric: "Nueva solicitud", detail: "Centro → Aeropuerto", accent: "bg-sky-300" },
  { id: "dispatch", label: "Asignación", icon: UsersRound, title: "Despacha con una vista clara de la operación.", text: "El equipo puede revisar el estado disponible y asignar el siguiente paso de manera controlada.", metric: "Conductor disponible", detail: "En zona de recogida", accent: "bg-emerald-300" },
  { id: "monitor", label: "Seguimiento", icon: MapPinned, title: "Monitorea el viaje cuando realmente importa.", text: "La ruta, el estado y la comunicación se concentran en un flujo fácil de entender.", metric: "Ruta activa", detail: "Actualización en vivo", accent: "bg-violet-300" },
  { id: "close", label: "Cierre", icon: BarChart3, title: "Cierra el ciclo con información accionable.", text: "La operación queda lista para revisar el viaje y mantener visibles los siguientes movimientos.", metric: "Viaje completado", detail: "Listo para reporte", accent: "bg-amber-300" },
] as const;

export function FleetGuidedDemo() {
  const [sceneId, setSceneId] = useState<typeof scenes[number]["id"]>("request");
  const active = scenes.find(scene => scene.id === sceneId) || scenes[0];
  const Icon = active.icon;

  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#071016] shadow-2xl shadow-slate-950/15">
      <div className="grid lg:grid-cols-[.8fr_1.2fr]">
        <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200"><CarFront size={13} /> Demo guiada de flotilla</span>
          <h3 className="mt-5 text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Ve el recorrido de una operación, paso a paso.</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/55">Es una vista explicativa: cada etapa se puede recorrer sin salir de la landing.</p>
          <div className="mt-7 space-y-2">{scenes.map((scene, index) => { const SceneIcon = scene.icon; const activeScene = scene.id === sceneId; return <button key={scene.id} onClick={() => setSceneId(scene.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${activeScene ? "border-emerald-300/45 bg-emerald-300/10 text-white" : "border-transparent text-white/50 hover:bg-white/[.05]"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-extrabold ${activeScene ? "bg-emerald-300 text-[#071016]" : "bg-white/[.07] text-white/55"}`}>{index + 1}</span><SceneIcon size={16} className={activeScene ? "text-emerald-200" : ""} /><span className="text-sm font-semibold">{scene.label}</span></button>; })}</div>
        </div>
        <div className="relative min-h-[26rem] overflow-hidden p-6 lg:p-8"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(65,227,136,.16),transparent_28%),linear-gradient(125deg,rgba(255,255,255,.02),transparent)]" />
          <div className="relative flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-white/40">Etapa activa</p><h4 className="mt-2 text-xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{active.title}</h4></div><div className={`grid h-12 w-12 place-items-center rounded-2xl ${active.accent} text-[#071016]`}><Icon size={22} /></div></div>
          <p className="relative mt-4 max-w-lg text-sm leading-relaxed text-white/60">{active.text}</p>
          <div className="relative mt-8 rounded-2xl border border-white/10 bg-black/25 p-5"><div className="flex items-center justify-between text-xs"><span className="text-white/45">Estado de operación</span><span className="inline-flex items-center gap-1 text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" /> En revisión</span></div><div className="mt-5 grid grid-cols-[.7fr_1.3fr] gap-4"><div className="rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{active.metric}</p><p className="mt-2 text-sm font-bold text-white">{active.detail}</p></div><div className="relative overflow-hidden rounded-xl border border-emerald-300/20 bg-emerald-300/[.06] p-4"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,transparent_49%,rgba(255,255,255,.15)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(255,255,255,.12)_50%,transparent_51%)] [background-size:42px_42px]" /><div className="relative flex h-full items-center gap-2"><MapPinned className="text-emerald-200" size={20} /><div className="h-[3px] flex-1 rounded-full bg-emerald-300/70" /><CarFront className="text-emerald-200" size={21} /></div></div></div></div>
          <div className="relative mt-5 flex items-center justify-between"><span className="text-xs text-white/45">Escena {scenes.findIndex(scene => scene.id === sceneId) + 1} de {scenes.length}</span><button onClick={() => setSceneId(scenes[(scenes.findIndex(scene => scene.id === sceneId) + 1) % scenes.length].id)} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-200 transition hover:translate-x-1">Siguiente etapa <ChevronRight size={16} /></button></div>
        </div>
      </div>
    </div>
  );
}
