import { Shield, Star, Clock, CreditCard, MapPin, ThumbsUp, Zap, Heart } from "lucide-react";

export default function ForClientsSection() {
  const { lang } = useI18n();

  const copy = {
    es: {
      badge: "🚕 Para pasajeros",
      title: "Tu taxi en minutos.",
      titleHighlight: "Sin sorpresas. Sin esperas.",
      sub: "Precios justos, conductores verificados y la comodidad de pedir tu viaje desde donde estés. Así de simple.",
      benefits: [
        { title: "Precios que cuidan tu bolsillo", desc: "Tarifas transparentes desde el primer momento. Sabes cuánto pagas antes de subir al taxi." },
        { title: "Conductores verificados", desc: "Cada conductor pasa por un proceso de verificación de identidad y antecedentes. Tu seguridad primero." },
        { title: "Llega en 3 a 8 minutos", desc: "Conductores disponibles cerca de ti en todo momento. Sin largas esperas ni excusas." },
        { title: "Califica tu experiencia", desc: "Tu opinión importa. Califica cada viaje y ayúdanos a mantener el mejor servicio de la ciudad." },
      ],
      quote: '"El taxi más rápido que he pedido en mi vida."',
      quoteAuthor: "— María G., usuaria frecuente",
      statsLabel: "Lo que dicen nuestros pasajeros",
      stats: [{ value: "4.9★", label: "Calificación promedio" }, { value: "3 min", label: "Tiempo de llegada" }, { value: "0 contratos", label: "Sin compromisos" }],
      payLabel: "Acepta todos los métodos de pago",
      methods: ["💵 Efectivo", "💳 Tarjeta", "📱 Zelle", "🏦 Transferencia", "📲 Pago Móvil"],
    },
    en: {
      badge: "🚕 For passengers",
      title: "Your taxi in minutes.",
      titleHighlight: "No surprises. No waiting.",
      sub: "Fair prices, verified drivers and the convenience of requesting your ride from anywhere. That simple.",
      benefits: [
        { title: "Prices that care for your wallet", desc: "Transparent fares from the start. You know what you pay before getting in the taxi." },
        { title: "Verified drivers", desc: "Every driver goes through an identity and background verification process. Your safety first." },
        { title: "Arrives in 3 to 8 minutes", desc: "Drivers available near you at all times. No long waits or excuses." },
        { title: "Rate your experience", desc: "Your opinion matters. Rate every trip and help us maintain the best service in the city." },
      ],
      quote: '"The fastest taxi I have ever requested in my life."',
      quoteAuthor: "— María G., frequent user",
      statsLabel: "What our passengers say",
      stats: [{ value: "4.9★", label: "Average rating" }, { value: "3 min", label: "Arrival time" }, { value: "0 contracts", label: "No commitments" }],
      payLabel: "Accepts all payment methods",
      methods: ["💵 Cash", "💳 Card", "📱 Zelle", "🏦 Transfer", "📲 Mobile Pay"],
    },
    fr: {
      badge: "🚕 Pour les passagers",
      title: "Votre taxi en quelques minutes.",
      titleHighlight: "Sans surprises. Sans attente.",
      sub: "Des prix justes, des chauffeurs vérifiés et la commodité de demander votre trajet de n'importe où. Aussi simple que ça.",
      benefits: [
        { title: "Des prix qui respectent votre budget", desc: "Des tarifs transparents dès le début. Vous savez ce que vous payez avant de monter dans le taxi." },
        { title: "Chauffeurs vérifiés", desc: "Chaque chauffeur passe par un processus de vérification d'identité et d'antécédents. Votre sécurité d'abord." },
        { title: "Arrive en 3 à 8 minutes", desc: "Des chauffeurs disponibles près de vous à tout moment. Sans longues attentes ni excuses." },
        { title: "Évaluez votre expérience", desc: "Votre avis compte. Évaluez chaque trajet et aidez-nous à maintenir le meilleur service de la ville." },
      ],
      quote: '"Le taxi le plus rapide que j\'ai jamais commandé de ma vie."',
      quoteAuthor: "— María G., utilisatrice régulière",
      statsLabel: "Ce que disent nos passagers",
      stats: [{ value: "4.9★", label: "Note moyenne" }, { value: "3 min", label: "Temps d'arrivée" }, { value: "0 contrats", label: "Sans engagement" }],
      payLabel: "Accepte tous les modes de paiement",
      methods: ["💵 Espèces", "💳 Carte", "📱 Zelle", "🏦 Virement", "📲 Paiement mobile"],
    },
  };

  const c = copy[lang as keyof typeof copy] || copy.es;

  return (
    <section id="clientes" className="py-20 lg:py-28" style={{ background: "oklch(0.98 0.005 100)" }}>
      <div className="container">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: "oklch(0.76 0.18 148 / 0.12)", color: "oklch(0.35 0.12 148)" }}>
            {c.badge}
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            {c.title}<br />
            <span style={{ color: "oklch(0.52 0.12 148)" }}>{c.titleHighlight}</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            {c.sub}
          </p>
        </div>

        {/* Benefits grid */}
        {/* Hero image + benefits layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
            <img
              src="/manus-storage/landing_clientes_fc4e76ec.jpg"
              alt="Pasajera feliz usando WhatsApp Taxi"
              className="w-full h-full object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.76 0.18 148 / 0.15)" }}>
                  <Star size={18} style={{ color: "oklch(0.52 0.12 148)" }} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Calificación promedio</p>
                  <p className="font-extrabold text-slate-900">4.9 ★ · +2,400 viajes hoy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: CreditCard, color: "#25D366", ...c.benefits[0] },
            { icon: Shield, color: "#3B82F6", ...c.benefits[1] },
            { icon: Clock, color: "#F59E0B", ...c.benefits[2] },
            { icon: Star, color: "#8B5CF6", ...c.benefits[3] },
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
        </div>

        {/* Social proof strip */}
        <div className="rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8" style={{ background: "linear-gradient(135deg, oklch(0.10 0.01 250), oklch(0.14 0.02 200))" }}>
          <div className="flex-1 text-center lg:text-left">
            <p className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-2">{c.statsLabel}</p>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              {c.quote}
            </h3>
            <p className="text-white/50 text-sm">{c.quoteAuthor}</p>
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
          <p className="text-slate-400 text-sm mb-4 font-medium">{c.payLabel}</p>
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
import { useI18n } from "@/contexts/I18nContext";
