import { BarChart3, Users, Settings, ChevronRight, TrendingUp, Globe, Headphones } from "lucide-react";

export default function ForFleetSection() {
  return (
    <section id="flotilla" className="py-20 lg:py-28" style={{ background: "oklch(0.98 0.005 100)" }}>
      <div className="container">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: "oklch(0.52 0.12 148 / 0.12)", color: "oklch(0.35 0.12 148)" }}>
            🏢 Para empresas y flotillas
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Tu propia empresa de taxis.<br />
            <span style={{ color: "oklch(0.52 0.12 148)" }}>Lista en menos de un día.</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Gestiona toda tu flotilla desde un panel centralizado. Más viajes, menos caos, más ganancias. Sin necesidad de un equipo técnico.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {[
            { icon: Users, color: "#25D366", title: "Gestiona todos tus conductores", desc: "Agrega, suspende o activa conductores con un clic. Ve quién está disponible en tiempo real en el mapa." },
            { icon: BarChart3, color: "#3B82F6", title: "Reportes de ingresos en tiempo real", desc: "Sabe exactamente cuánto gana cada conductor, cuántos viajes completó y cuál es tu comisión del día." },
            { icon: Settings, color: "#8B5CF6", title: "Personaliza todo a tu marca", desc: "Cambia el nombre, logo, colores y tarifas de tu plataforma. Tus clientes verán tu marca, no la nuestra." },
            { icon: TrendingUp, color: "#F59E0B", title: "Escala sin límites", desc: "Empieza con 5 conductores o con 500. La plataforma crece contigo sin costos adicionales por conductor." },
            { icon: Globe, color: "#EC4899", title: "Acepta pedidos 24/7", desc: "Tu plataforma nunca duerme. Los clientes pueden pedir taxi a cualquier hora, tú solo cobras la comisión." },
            { icon: Headphones, color: "#14B8A6", title: "Soporte incluido en todos los planes", desc: "No estás solo. Nuestro equipo te ayuda a configurar y crecer tu negocio desde el primer día." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: color + "18" }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ROI Banner */}
        <div className="rounded-3xl overflow-hidden">
          <div className="p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8" style={{ background: "linear-gradient(135deg, oklch(0.10 0.01 250), oklch(0.18 0.04 200))" }}>
            <div className="flex-1 text-center lg:text-left">
              <p className="text-white/50 text-sm uppercase tracking-widest font-semibold mb-3">El negocio que ya funciona</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                Con solo 10 conductores activos puedes generar más de <span style={{ color: "oklch(0.76 0.18 148)" }}>$3,000 al mes</span> en comisiones.
              </h3>
              <p className="text-white/50 text-sm mb-6">Basado en un promedio de 15 viajes/día por conductor a $20 con 10% de comisión.</p>
              <a href="/register" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("registerRole","fleet"); window.location.href="/register"; }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]" style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
                Crear mi flotilla ahora <ChevronRight size={16} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              {[{ v: "5 min", l: "Para configurar" }, { v: "$0", l: "Costo inicial" }, { v: "∞", l: "Conductores" }, { v: "24/7", l: "Disponibilidad" }].map(s => (
                <div key={s.l} className="text-center p-4 rounded-2xl" style={{ background: "oklch(0.76 0.18 148 / 0.1)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}>
                  <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{s.v}</p>
                  <p className="text-white/50 text-xs mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
