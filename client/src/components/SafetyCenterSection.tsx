import { useState } from "react";
import { BellRing, CheckCircle2, ChevronRight, Eye, LockKeyhole, MapPinned, ShieldCheck, Share2 } from "lucide-react";
import { useLocation } from "wouter";

const safetyModes = [
  { id: "tracking", label: "Seguimiento compartible", icon: Share2, title: "Comparte el viaje sin perder el control.", description: "Envía un enlace de seguimiento a un contacto de confianza mientras mantienes visibles tu ruta, estado y hora estimada.", points: ["Ruta actualizada", "Estado de viaje visible", "Control desde el mismo viaje"] },
  { id: "support", label: "Ayuda en viaje", icon: BellRing, title: "La ayuda importante está a un toque.", description: "Accede a soporte, chat y acciones de seguridad desde el modo de viaje activo, sin esconder los controles relevantes.", points: ["Acceso rápido a soporte", "Chat seguro", "Acciones contextuales"] },
  { id: "privacy", label: "Privacidad", icon: LockKeyhole, title: "Controles claros para cada etapa.", description: "La experiencia presenta la información necesaria para el viaje y evita sobrecargar al pasajero con datos secundarios.", points: ["Información contextual", "Acceso por rol", "Estados comprensibles"] },
] as const;

export default function SafetyCenterSection() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<typeof safetyModes[number]["id"]>("tracking");
  const active = safetyModes.find(mode => mode.id === selected) || safetyModes[0];
  const ActiveIcon = active.icon;

  return (
    <section id="seguridad" className="relative overflow-hidden bg-[#071016] py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(65,227,136,.15),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(35,125,112,.15),transparent_32%)]" />
      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-emerald-200"><ShieldCheck size={14} /> Seguridad pensada para el viaje</span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white lg:text-5xl" style={{ fontFamily: "'Sora', sans-serif" }}>Confianza visible,<br /><span className="text-emerald-300">sin fricción.</span></h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">Los controles esenciales se muestran cuando importan: seguimiento, ayuda y privacidad en una experiencia clara.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {safetyModes.map(mode => {
              const Icon = mode.icon;
              const activeMode = selected === mode.id;
              return <button key={mode.id} onClick={() => setSelected(mode.id)} className={`min-w-[13rem] rounded-2xl border p-4 text-left transition-all ${activeMode ? "border-emerald-300/50 bg-emerald-300/15 text-white shadow-lg shadow-emerald-950/30" : "border-white/10 bg-white/[.035] text-white/55 hover:border-white/20 hover:bg-white/[.06]"}`}>
                <Icon size={19} className={activeMode ? "text-emerald-300" : "text-white/45"} /><p className="mt-3 text-sm font-bold">{mode.label}</p>
              </button>;
            })}
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/[.045] p-6 shadow-2xl shadow-black/20 lg:p-8">
            <div className="flex items-start justify-between gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300 text-[#071016]"><ActiveIcon size={23} /></div><span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200"><Eye size={13} /> Visible cuando importa</span></div>
            <h3 className="mt-7 max-w-xl text-2xl font-extrabold text-white lg:text-3xl" style={{ fontFamily: "'Sora', sans-serif" }}>{active.title}</h3>
            <p className="mt-4 max-w-xl leading-relaxed text-white/60">{active.description}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{active.points.map(point => <div key={point} className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-relaxed text-white/70"><CheckCircle2 size={15} className="mt-.5 flex-shrink-0 text-emerald-300" />{point}</div>)}</div>
            <button onClick={() => navigate("/trip-tracking")} className="mt-7 inline-flex items-center gap-2 font-bold text-emerald-300 transition hover:translate-x-1">Ver modo de viaje activo <ChevronRight size={17} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
