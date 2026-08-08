import { DollarSign, Clock, Smartphone, Award, ChevronRight, CheckCircle } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

export default function ForDriversSection() {
  const { lang } = useI18n();

  const copy = {
    es: {
      badge: "🚗 Para conductores",
      title: "Maneja cuando quieras.",
      titleHighlight: "Gana lo que mereces.",
      sub: "Sin jefes. Sin horarios fijos. Sin contratos que te aten. Tú decides cuándo trabajar y cuánto ganar.",
      earningsLabel: "Ejemplo de ganancias semanales",
      rows: [{ label: "Viajes cortos", value: "~$8 c/u" }, { label: "Al aeropuerto", value: "~$35 c/u" }, { label: "Horas pico", value: "+50% tarifa" }, { label: "Bonos 5★", value: "Extras semanales" }],
      benefits: [
        { title: "Tú decides tu horario", desc: "Conéctate cuando quieras y desconéctate cuando necesites. Sin penalizaciones, sin obligaciones." },
        { title: "Cobros instantáneos", desc: "Recibe tu pago al finalizar cada viaje. Sin esperas de semanas ni descuentos sorpresa." },
        { title: "App simple, sin complicaciones", desc: "Acepta viajes con un toque. Sin capacitaciones largas ni manuales técnicos. En 5 minutos ya estás listo." },
        { title: "Sin contratos ni compromisos", desc: "Únete hoy y sal mañana si quieres. No pedimos exclusividad ni firmas de documentos complejos." },
      ],
      reqTitle: "¿Qué necesitas para empezar?",
      reqs: ["🪪 Licencia de conducir vigente", "🚗 Vehículo propio en buen estado", "📱 Un smartphone con internet", "✅ Pasar la verificación de identidad"],
      cta: "Quiero ser conductor",
      ctaSub: "Registro gratuito · Sin cuota de membresía · Sin contratos",
    },
    en: {
      badge: "🚗 For drivers",
      title: "Drive whenever you want.",
      titleHighlight: "Earn what you deserve.",
      sub: "No bosses. No fixed schedules. No binding contracts. You decide when to work and how much to earn.",
      earningsLabel: "Weekly earnings example",
      rows: [{ label: "Short trips", value: "~$8 each" }, { label: "Airport runs", value: "~$35 each" }, { label: "Peak hours", value: "+50% fare" }, { label: "5★ bonuses", value: "Weekly extras" }],
      benefits: [
        { title: "You set your own schedule", desc: "Connect whenever you want and disconnect when you need to. No penalties, no obligations." },
        { title: "Instant payments", desc: "Receive your payment at the end of each trip. No weeks of waiting or surprise deductions." },
        { title: "Simple app, no hassle", desc: "Accept trips with a tap. No long training or technical manuals. In 5 minutes you're ready." },
        { title: "No contracts or commitments", desc: "Join today and leave tomorrow if you want. We don't ask for exclusivity or complex document signing." },
      ],
      reqTitle: "What do you need to get started?",
      reqs: ["🪪 Valid driver's license", "🚗 Your own vehicle in good condition", "📱 A smartphone with internet", "✅ Pass identity verification"],
      cta: "I want to be a driver",
      ctaSub: "Free registration · No membership fee · No contracts",
    },
    fr: {
      badge: "🚗 Pour les chauffeurs",
      title: "Conduisez quand vous voulez.",
      titleHighlight: "Gagnez ce que vous méritez.",
      sub: "Pas de patron. Pas d'horaires fixes. Pas de contrats contraignants. Vous décidez quand travailler et combien gagner.",
      earningsLabel: "Exemple de gains hebdomadaires",
      rows: [{ label: "Trajets courts", value: "~$8 chacun" }, { label: "Aéroport", value: "~$35 chacun" }, { label: "Heures de pointe", value: "+50% tarif" }, { label: "Bonus 5★", value: "Extras hebdo" }],
      benefits: [
        { title: "Vous fixez votre propre horaire", desc: "Connectez-vous quand vous voulez et déconnectez-vous quand vous en avez besoin. Sans pénalités, sans obligations." },
        { title: "Paiements instantanés", desc: "Recevez votre paiement à la fin de chaque trajet. Sans attendre des semaines ni déductions surprises." },
        { title: "Application simple, sans complications", desc: "Acceptez des trajets d'un toucher. Sans longues formations ni manuels techniques. En 5 minutes vous êtes prêt." },
        { title: "Sans contrats ni engagements", desc: "Rejoignez aujourd'hui et partez demain si vous voulez. Nous ne demandons pas d'exclusivité ni de signatures complexes." },
      ],
      reqTitle: "Qu'avez-vous besoin pour commencer?",
      reqs: ["🪪 Permis de conduire valide", "🚗 Votre propre véhicule en bon état", "📱 Un smartphone avec internet", "✅ Passer la vérification d'identité"],
      cta: "Je veux être chauffeur",
      ctaSub: "Inscription gratuite · Sans frais d'adhésion · Sans contrats",
    },
  };

  const c = copy[lang as keyof typeof copy] || copy.es;

  return (
    <section id="conductores" className="py-20 lg:py-28" style={{ background: "oklch(0.10 0.01 250)" }}>
      <div className="container">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: "oklch(0.76 0.18 148 / 0.15)", color: "oklch(0.76 0.18 148)" }}>
            {c.badge}
          </span>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            {c.title}<br />
            <span style={{ color: "oklch(0.76 0.18 148)" }}>{c.titleHighlight}</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">{c.sub}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
            <img src="/manus-storage/landing_conductores_a37cc2d1.jpg" alt="Conductor feliz ganando con WhatsApp Taxi" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-2xl px-5 py-4" style={{ background: "oklch(0.10 0.01 250 / 0.9)", backdropFilter: "blur(12px)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}>
                <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">{c.earningsLabel}</p>
                <p className="text-3xl font-extrabold mb-2" style={{ color: "oklch(0.76 0.18 148)", fontFamily: "'Sora', sans-serif" }}>$800 – $1,500</p>
                <div className="grid grid-cols-2 gap-2">
                  {c.rows.map(r => (
                    <div key={r.label} className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-white/60 text-xs">{r.label}</span>
                      <span className="font-bold text-xs" style={{ color: "oklch(0.76 0.18 148)" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {c.benefits.map(({ title, desc }, i) => {
              const icons = [Clock, DollarSign, Smartphone, Award];
              const Icon = icons[i];
              return (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "oklch(0.76 0.18 148 / 0.15)" }}>
                    <Icon size={18} style={{ color: "oklch(0.76 0.18 148)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl p-8" style={{ background: "oklch(0.76 0.18 148 / 0.08)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}>
          <h3 className="text-white font-bold text-lg mb-5 text-center" style={{ fontFamily: "'Sora', sans-serif" }}>{c.reqTitle}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {c.reqs.map(r => (
              <div key={r} className="flex items-center gap-2">
                <CheckCircle size={15} style={{ color: "oklch(0.76 0.18 148)", flexShrink: 0 }} />
                <span className="text-white/70 text-sm">{r}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="/register" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("registerRole","driver"); window.location.href="/register"; }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
              {c.cta} <ChevronRight size={16} />
            </a>
            <p className="text-white/30 text-xs mt-3">{c.ctaSub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
