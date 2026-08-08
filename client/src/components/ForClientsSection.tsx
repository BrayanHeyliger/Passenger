import { Shield, Star, Clock, CreditCard, MapPin, ThumbsUp, Zap, Heart } from "lucide-react";

export default function ForClientsSection() {
  return (
    <section id="clientes" className="py-20 lg:py-28" style={{ background: "oklch(0.98 0.005 100)" }}>
      <div className="container">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: "oklch(0.76 0.18 148 / 0.12)", color: "oklch(0.35 0.12 148)" }}>
            🚕 Para pasajeros
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Tu taxi en minutos.<br />
            <span style={{ color: "oklch(0.52 0.12 148)" }}>Sin sorpresas. Sin esperas.</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Precios justos, conductores verificados y la comodidad de pedir tu viaje desde donde estés. Así de simple.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: CreditCard, color: "#25D366", title: "Precios que cuidan tu bolsillo", desc: "Tarifas transparentes desde el primer momento. Sabes cuánto pagas antes de subir al taxi." },
            { icon: Shield, color: "#3B82F6", title: "Conductores verificados", desc: "Cada conductor pasa por un proceso de verificación de identidad y antecedentes. Tu seguridad primero." },
            { icon: Clock, color: "#F59E0B", title: "Llega en 3 a 8 minutos", desc: "Conductores disponibles cerca de ti en todo momento. Sin largas esperas ni excusas." },
            { icon: Star, color: "#8B5CF6", title: "Califica tu experiencia", desc: "Tu opinión importa. Califica cada viaje y ayúdanos a mantener el mejor servicio de la ciudad." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: color + "18" }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-base">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8" style={{ background: "linear-gradient(135deg, oklch(0.10 0.01 250), oklch(0.14 0.02 200))" }}>
          <div className="flex-1 text-center lg:text-left">
            <p className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-2">Lo que dicen nuestros pasajeros</p>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              "El taxi más rápido que he pedido en mi vida."
            </h3>
            <p className="text-white/50 text-sm">— María G., usuaria frecuente</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center flex-shrink-0">
            {[{ value: "4.9★", label: "Calificación promedio" }, { value: "3 min", label: "Tiempo de llegada" }, { value: "0 contratos", label: "Sin compromisos" }].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm mb-4 font-medium">Acepta todos los métodos de pago</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["💵 Efectivo", "💳 Tarjeta", "📱 Zelle", "🏦 Transferencia", "📲 Pago Móvil"].map(m => (
              <span key={m} className="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 text-slate-600 bg-white">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
