import { useState } from "react";
import { BarChart3, Users, Settings, ChevronRight, TrendingUp, Globe, Headphones, Calculator, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/contexts/I18nContext";
import { calculateFleetRoi, DRIVER_STEPS, PRO_MONTHLY_PRICE } from "@/lib/fleetRoi";
import { FleetGuidedDemo } from "@/components/FleetGuidedDemo";

type CalculatorCopy = {
  eyebrow: string;
  question: string;
  estimateLabel: string;
  investmentLabel: string;
  netLabel: string;
  planLabel: string;
  insight: (drivers: number, commissions: string) => string;
  formula: string;
  disclaimer: string;
};

export default function ForFleetSection() {
  const { lang } = useI18n();

  const copy = {
    es: {
      badge: "🏢 Para empresas y flotillas",
      title: "Tu propia empresa de taxis.",
      titleHighlight: "Lista en menos de un día.",
      sub: "Gestiona toda tu flotilla desde un panel centralizado. Más viajes, menos caos, más ganancias. Sin necesidad de un equipo técnico.",
      features: [
        { title: "Gestiona todos tus conductores", desc: "Agrega, suspende o activa conductores con un clic. Ve quién está disponible en tiempo real en el mapa." },
        { title: "Reportes de ingresos en tiempo real", desc: "Sabe exactamente cuánto gana cada conductor, cuántos viajes completó y cuál es tu comisión del día." },
        { title: "Personaliza todo a tu marca", desc: "Cambia el nombre, logo, colores y tarifas de tu plataforma. Tus clientes verán tu marca, no la nuestra." },
        { title: "Escala sin límites", desc: "Empieza con 5 conductores o con 500. La plataforma crece contigo sin costos adicionales por conductor." },
        { title: "Acepta pedidos 24/7", desc: "Tu plataforma nunca duerme. Los clientes pueden pedir taxi a cualquier hora, tú solo cobras la comisión." },
        { title: "Soporte incluido en todos los planes", desc: "No estás solo. Nuestro equipo te ayuda a configurar y crecer tu negocio desde el primer día." },
      ],
      roiLabel: "El negocio que ya funciona",
      roiTitle: 'Con solo 10 conductores activos puedes generar más de <span style="color:oklch(0.76 0.18 148)">$3,000 al mes</span> en comisiones.',
      roiSub: "Basado en un promedio de 15 viajes/día por conductor a $20 con 10% de comisión.",
      calculator: {
        eyebrow: "Calculadora de oportunidad",
        question: "¿Cuántos conductores tienes?",
        estimateLabel: "Comisiones mensuales estimadas",
        investmentLabel: "Inversión mensual",
        netLabel: "Potencial después del plan",
        planLabel: "Plan Pro",
        insight: (drivers: number, commissions: string) => `Con ${drivers} conductores, podrías generar alrededor de $${commissions} USD/mes en comisiones.`,
        formula: "Ejemplo: 5 viajes/día × $20 × 10% de comisión × 30 días.",
        disclaimer: "Estimación ilustrativa; los resultados reales dependen de la demanda, tarifas, zona y operación de tu flotilla.",
      },
      roiCta: "Crear mi flotilla ahora",
      stats: [{ v: "5 min", l: "Para configurar" }, { v: "$0", l: "Costo inicial" }, { v: "∞", l: "Conductores" }, { v: "24/7", l: "Disponibilidad" }],
      photoLabel: "Panel en tiempo real",
      photoSub: "Control total de tu flotilla",
      scaleTitle: "Todo lo que necesitas para",
      scaleTitleHighlight: "escalar tu negocio.",
      scaleSub: "Desde el primer conductor hasta una flota de cientos, tu panel crece contigo. Sin costos extra, sin complicaciones técnicas.",
      items: ["✅ Panel de control con mapa en tiempo real", "✅ Reportes de ingresos por conductor", "✅ Gestión de documentos y aprobaciones", "✅ Configuración de tarifas y comisiones", "✅ Mensajería directa con conductores", "✅ Soporte técnico incluido"],
      cta: "Crear mi flotilla ahora",
    },
    en: {
      badge: "🏢 For companies and fleets",
      title: "Your own taxi company.",
      titleHighlight: "Ready in less than a day.",
      sub: "Manage your entire fleet from a centralized panel. More trips, less chaos, more earnings. No technical team needed.",
      features: [
        { title: "Manage all your drivers", desc: "Add, suspend or activate drivers with a click. See who is available in real time on the map." },
        { title: "Real-time revenue reports", desc: "Know exactly how much each driver earns, how many trips they completed and what your commission is today." },
        { title: "Customize everything to your brand", desc: "Change the name, logo, colors and fares of your platform. Your clients will see your brand, not ours." },
        { title: "Scale without limits", desc: "Start with 5 drivers or 500. The platform grows with you at no additional cost per driver." },
        { title: "Accept orders 24/7", desc: "Your platform never sleeps. Clients can request a taxi at any time, you just collect the commission." },
        { title: "Support included in all plans", desc: "You're not alone. Our team helps you set up and grow your business from day one." },
      ],
      roiLabel: "The business that already works",
      roiTitle: 'With just 10 active drivers you can generate more than <span style="color:oklch(0.76 0.18 148)">$3,000 per month</span> in commissions.',
      roiSub: "Based on an average of 15 trips/day per driver at $20 with 10% commission.",
      calculator: {
        eyebrow: "Opportunity calculator",
        question: "How many drivers do you have?",
        estimateLabel: "Estimated monthly commissions",
        investmentLabel: "Monthly investment",
        netLabel: "Potential after the plan",
        planLabel: "Pro Plan",
        insight: (drivers: number, commissions: string) => `With ${drivers} drivers, you could generate around $${commissions} USD/month in commissions.`,
        formula: "Example: 5 trips/day × $20 × 10% commission × 30 days.",
        disclaimer: "Illustrative estimate; actual results depend on demand, fares, service area and your fleet operation.",
      },
      roiCta: "Create my fleet now",
      stats: [{ v: "5 min", l: "To configure" }, { v: "$0", l: "Initial cost" }, { v: "∞", l: "Drivers" }, { v: "24/7", l: "Availability" }],
      photoLabel: "Real-time panel",
      photoSub: "Total control of your fleet",
      scaleTitle: "Everything you need to",
      scaleTitleHighlight: "scale your business.",
      scaleSub: "From the first driver to a fleet of hundreds, your panel grows with you. No extra costs, no technical complications.",
      items: ["✅ Control panel with real-time map", "✅ Revenue reports per driver", "✅ Document management and approvals", "✅ Fare and commission configuration", "✅ Direct messaging with drivers", "✅ Technical support included"],
      cta: "Create my fleet now",
    },
    fr: {
      badge: "🏢 Pour les entreprises et flottes",
      title: "Votre propre entreprise de taxis.",
      titleHighlight: "Prête en moins d'un jour.",
      sub: "Gérez toute votre flotte depuis un panneau centralisé. Plus de trajets, moins de chaos, plus de gains. Sans équipe technique.",
      features: [
        { title: "Gérez tous vos chauffeurs", desc: "Ajoutez, suspendez ou activez des chauffeurs en un clic. Voyez qui est disponible en temps réel sur la carte." },
        { title: "Rapports de revenus en temps réel", desc: "Sachez exactement combien gagne chaque chauffeur, combien de trajets il a effectués et quelle est votre commission du jour." },
        { title: "Personnalisez tout à votre marque", desc: "Changez le nom, le logo, les couleurs et les tarifs de votre plateforme. Vos clients verront votre marque, pas la nôtre." },
        { title: "Évoluez sans limites", desc: "Commencez avec 5 chauffeurs ou 500. La plateforme grandit avec vous sans coûts supplémentaires par chauffeur." },
        { title: "Acceptez des commandes 24h/24", desc: "Votre plateforme ne dort jamais. Les clients peuvent commander un taxi à toute heure, vous ne faites que percevoir la commission." },
        { title: "Support inclus dans tous les plans", desc: "Vous n'êtes pas seul. Notre équipe vous aide à configurer et développer votre entreprise dès le premier jour." },
      ],
      roiLabel: "L'entreprise qui fonctionne déjà",
      roiTitle: 'Avec seulement 10 chauffeurs actifs vous pouvez générer plus de <span style="color:oklch(0.76 0.18 148)">3 000 $ par mois</span> en commissions.',
      roiSub: "Basé sur une moyenne de 15 trajets/jour par chauffeur à 20 $ avec 10% de commission.",
      calculator: {
        eyebrow: "Calculateur d'opportunité",
        question: "Combien de chauffeurs avez-vous ?",
        estimateLabel: "Commissions mensuelles estimées",
        investmentLabel: "Investissement mensuel",
        netLabel: "Potentiel après le plan",
        planLabel: "Plan Pro",
        insight: (drivers: number, commissions: string) => `Avec ${drivers} chauffeurs, vous pourriez générer environ $${commissions} USD/mois en commissions.`,
        formula: "Exemple : 5 trajets/jour × 20 $ × 10% de commission × 30 jours.",
        disclaimer: "Estimation illustrative ; les résultats réels dépendent de la demande, des tarifs, de la zone et de votre activité.",
      },
      roiCta: "Créer ma flotte maintenant",
      stats: [{ v: "5 min", l: "Pour configurer" }, { v: "0 $", l: "Coût initial" }, { v: "∞", l: "Chauffeurs" }, { v: "24/7", l: "Disponibilité" }],
      photoLabel: "Panneau en temps réel",
      photoSub: "Contrôle total de votre flotte",
      scaleTitle: "Tout ce dont vous avez besoin pour",
      scaleTitleHighlight: "développer votre activité.",
      scaleSub: "Du premier chauffeur à une flotte de centaines, votre panneau grandit avec vous. Sans coûts supplémentaires, sans complications techniques.",
      items: ["✅ Panneau de contrôle avec carte en temps réel", "✅ Rapports de revenus par chauffeur", "✅ Gestion des documents et approbations", "✅ Configuration des tarifs et commissions", "✅ Messagerie directe avec les chauffeurs", "✅ Support technique inclus"],
      cta: "Créer ma flotte maintenant",
    },
  };

  const c = copy[lang as keyof typeof copy] || copy.es;

  return (
    <section id="flotilla" className="py-20 lg:py-28" style={{ background: "oklch(0.98 0.005 100)" }}>
      <div className="container">
        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest" style={{ background: "oklch(0.52 0.12 148 / 0.12)", color: "oklch(0.35 0.12 148)" }}>
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

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {[
            { icon: Users, color: "#25D366", ...c.features[0] },
            { icon: BarChart3, color: "#3B82F6", ...c.features[1] },
            { icon: Settings, color: "#8B5CF6", ...c.features[2] },
            { icon: TrendingUp, color: "#F59E0B", ...c.features[3] },
            { icon: Globe, color: "#EC4899", ...c.features[4] },
            { icon: Headphones, color: "#14B8A6", ...c.features[5] },
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
              <p className="text-white/50 text-sm uppercase tracking-widest font-semibold mb-3">{c.roiLabel}</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                <span dangerouslySetInnerHTML={{ __html: c.roiTitle }} />
              </h3>
              <p className="text-white/50 text-sm mb-6">{c.roiSub}</p>
              <FleetRoiCalculator copy={c.calculator} lang={lang} />
              <a href="/register" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("registerRole","fleet"); window.location.href="/register"; }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]" style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
                Crear mi flotilla ahora <ChevronRight size={16} />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              {c.stats.map(s => (
                <div key={s.l} className="text-center p-4 rounded-2xl" style={{ background: "oklch(0.76 0.18 148 / 0.1)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}>
                  <p className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{s.v}</p>
                  <p className="text-white/50 text-xs mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FleetGuidedDemo />

        {/* Fleet photo section */}
        <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
            <img
              src="/assets-storage/landing_flotilla_9d84fc4e.jpg"
              alt="Empresario gestionando su flotilla de taxis"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.52 0.12 148 / 0.15)" }}>
                  <BarChart3 size={18} style={{ color: "oklch(0.35 0.12 148)" }} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{c.photoLabel}</p>
                  <p className="font-extrabold text-slate-900">{c.photoSub}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              {c.scaleTitle}<br />
              <span style={{ color: "oklch(0.52 0.12 148)" }}>{c.scaleTitleHighlight}</span>
            </h3>
            <p className="text-slate-500 leading-relaxed">
              {c.scaleSub}
            </p>
            <div className="space-y-3">
              {[
                ...c.items,
              ].map(item => (
                <p key={item} className="text-slate-700 text-sm font-medium">{item}</p>
              ))}
            </div>
            <a href="/register" onClick={(e) => { e.preventDefault(); sessionStorage.setItem("registerRole","fleet"); window.location.href="/register"; }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]" style={{ background: "oklch(0.52 0.12 148)", color: "white" }}>
              {c.cta} <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FleetRoiCalculator({ copy, lang }: { copy: CalculatorCopy; lang: string }) {
  const [driverStep, setDriverStep] = useState(1);
  const drivers = DRIVER_STEPS[driverStep];
  const { monthlyCommissions, potentialAfterPlan } = calculateFleetRoi(drivers);
  const locale = lang === "fr" ? "fr-FR" : lang === "en" ? "en-US" : "es-MX";
  const formatUsd = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

  return (
    <div className="mb-6 rounded-2xl border border-emerald-300/20 bg-black/20 p-5 text-left shadow-inner shadow-emerald-300/5">
      <div className="mb-4 flex items-center gap-2 text-emerald-200">
        <Calculator size={16} />
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{copy.eyebrow}</span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="text-sm font-semibold text-white">{copy.question}</p>
        <output className="rounded-full bg-emerald-300 px-3 py-1 text-sm font-extrabold text-slate-950" aria-live="polite">
          {drivers}
        </output>
      </div>

      <Slider
        aria-label={copy.question}
        className="mt-5 [&_[data-slot=slider-track]]:bg-white/15 [&_[data-slot=slider-range]]:bg-emerald-300 [&_[data-slot=slider-thumb]]:border-emerald-200 [&_[data-slot=slider-thumb]]:bg-slate-950"
        min={0}
        max={DRIVER_STEPS.length - 1}
        step={1}
        value={[driverStep]}
        onValueChange={([nextStep]) => setDriverStep(nextStep)}
      />
      <div className="mt-2 flex justify-between px-0.5 text-[11px] font-semibold text-white/45" aria-hidden="true">
        {DRIVER_STEPS.map(step => <span key={step}>{step}</span>)}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">{copy.estimateLabel}</p>
          <p className="mt-1 text-xl font-extrabold text-emerald-200" style={{ fontFamily: "'Sora', sans-serif" }}>${formatUsd(monthlyCommissions)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{copy.investmentLabel}</p>
          <p className="mt-1 text-xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>${PRO_MONTHLY_PRICE}</p>
          <p className="mt-0.5 text-[10px] text-white/45">{copy.planLabel}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
        <span className="text-xs font-semibold text-white/65">{copy.netLabel}</span>
        <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-200"><DollarSign size={14} />{formatUsd(potentialAfterPlan)}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/75">{copy.insight(drivers, formatUsd(monthlyCommissions))}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/45">{copy.formula}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-white/35">{copy.disclaimer}</p>
    </div>
  );
}
