import { DollarSign, Clock, Smartphone, Award, ChevronRight, CheckCircle } from "lucide-react";

export default function ForDriversSection() {
  return (
    <section id="conductores" className="py-20 lg:py-28" style={{ background: "oklch(0.10 0.01 250)" }}>
      <div className="container">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: "oklch(0.76 0.18 148 / 0.15)", color: "oklch(0.76 0.18 148)" }}>
            🚗 Para conductores
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Maneja cuando quieras.<br />
            <span style={{ color: "oklch(0.76 0.18 148)" }}>Gana lo que mereces.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Sin jefes. Sin horarios fijos. Sin contratos que te aten. Tú decides cuándo trabajar y cuánto ganar.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: photo + earnings overlay */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
            <img
              src="/manus-storage/landing_conductores_a37cc2d1.jpg"
              alt="Conductor feliz ganando con WhatsApp Taxi"
              className="w-full h-full object-cover"
            />
            {/* Earnings overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-2xl px-5 py-4" style={{ background: "oklch(0.10 0.01 250 / 0.9)", backdropFilter: "blur(12px)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}>
                <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">Ejemplo de ganancias semanales</p>
                <p className="text-3xl font-extrabold mb-2" style={{ color: "oklch(0.76 0.18 148)", fontFamily: "'Sora', sans-serif" }}>$800 – $1,500</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "Viajes cortos", value: "~$8 c/u" }, { label: "Al aeropuerto", value: "~$35 c/u" }, { label: "Horas pico", value: "+50% tarifa" }, { label: "Bonos 5★", value: "Extras semanales" }].map(r => (
                    <div key={r.label} className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-white/60 text-xs">{r.label}</span>
                      <span className="font-bold text-xs" style={{ color: "oklch(0.76 0.18 148)" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: benefits */}
          <div className="space-y-5">
            {[
              { icon: Clock, title: "Tú decides tu horario", desc: "Conéctate cuando quieras y desconéctate cuando necesites. Sin penalizaciones, sin obligaciones." },
              { icon: DollarSign, title: "Cobros instantáneos", desc: "Recibe tu pago al finalizar cada viaje. Sin esperas de semanas ni descuentos sorpresa." },
              { icon: Smartphone, title: "App simple, sin complicaciones", desc: "Acepta viajes con un toque. Sin capacitaciones largas ni manuales técnicos. En 5 minutos ya estás listo." },
              { icon: Award, title: "Sin contratos ni compromisos", desc: "Únete hoy y sal mañana si quieres. No pedimos exclusividad ni firmas de documentos complejos." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "oklch(0.76 0.18 148 / 0.15)" }}>
                  <Icon size={18} style={{ color: "oklch(0.76 0.18 148)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="rounded-3xl p-8" style={{ background: "oklch(0.76 0.18 148 / 0.08)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}>
          <h3 className="text-white font-bold text-lg mb-5 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>¿Qué necesitas para empezar?</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {["🪪 Licencia de conducir vigente", "🚗 Vehículo propio en buen estado", "📱 Un smartphone con internet", "✅ Pasar la verificación de identidad"].map(r => (
              <div key={r} className="flex items-center gap-2">
                <CheckCircle size={15} style={{ color: "oklch(0.76 0.18 148)", flexShrink: 0 }} />
                <span className="text-white/70 text-sm">{r}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="/register" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("registerRole","driver"); window.location.href="/register"; }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
              Quiero ser conductor <ChevronRight size={16} />
            </a>
            <p className="text-white/30 text-xs mt-3">Registro gratuito · Sin cuota de membresía · Sin contratos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
