/**
 * PricingSection — WhatsApp Taxi SaaS
 * Design: Verde Operacional — 3 planes, Pro destacado con fondo verde
 */
import { useRef, useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Zap, Building2, Crown } from "lucide-react";
import { useLocation } from "wouter";

const plans = [
  {
    name: "Básico",
    icon: Zap,
    price: "49",
    period: "/mes",
    description: "Ideal para conductores independientes o pequeñas flotas.",
    highlight: false,
    features: [
      { text: "Hasta 200 viajes/mes", included: true },
      { text: "Hasta 5 conductores", included: true },
      { text: "Bot WhatsApp básico", included: true },
      { text: "Dashboard de viajes", included: true },
      { text: "Google Maps integrado", included: true },
      { text: "Soporte por email", included: true },
      { text: "Reportes avanzados", included: false },
      { text: "App PWA conductores", included: false },
      { text: "Multi-zona de tarifas", included: false },
      { text: "API personalizada", included: false },
    ],
    cta: "Empezar gratis",
    badge: null,
  },
  {
    name: "Pro",
    icon: Building2,
    price: "149",
    period: "/mes",
    description: "Para empresas de taxi en crecimiento con múltiples conductores.",
    highlight: true,
    features: [
      { text: "Hasta 2,000 viajes/mes", included: true },
      { text: "Hasta 50 conductores", included: true },
      { text: "Bot WhatsApp avanzado", included: true },
      { text: "Dashboard en tiempo real", included: true },
      { text: "Google Maps completo", included: true },
      { text: "Soporte prioritario 24/7", included: true },
      { text: "Reportes y analíticas", included: true },
      { text: "App PWA conductores", included: true },
      { text: "Multi-zona de tarifas", included: true },
      { text: "API personalizada", included: false },
    ],
    cta: "Empezar con Pro",
    badge: "Más popular",
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "399",
    period: "/mes",
    description: "Para grandes flotas y empresas con necesidades avanzadas.",
    highlight: false,
    features: [
      { text: "Viajes ilimitados", included: true },
      { text: "Conductores ilimitados", included: true },
      { text: "Bot WhatsApp personalizado", included: true },
      { text: "Dashboard multi-empresa", included: true },
      { text: "Google Maps + Maps Platform", included: true },
      { text: "SLA garantizado + soporte dedicado", included: true },
      { text: "Reportes y BI avanzado", included: true },
      { text: "App PWA + app nativa", included: true },
      { text: "Tarifas dinámicas por zona", included: true },
      { text: "API completa + webhooks", included: true },
    ],
    cta: "Contactar ventas",
    badge: null,
  },
];

export default function PricingSection() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      className="py-20 lg:py-28 bg-white"
      ref={ref}
    >
      <div className="container">
        <div
          className="text-center max-w-2xl mx-auto mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "oklch(0.76 0.18 148 / 0.1)", color: "oklch(0.52 0.12 148)" }}
          >
            <Crown size={12} />
            {t.pricing.badge}
          </div>
          <h2
            className="text-3xl lg:text-4xl font-extrabold text-[oklch(0.14_0.01_250)] mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t.pricing.title}
          </h2>
          <p className="text-[oklch(0.55_0.01_80)] text-lg">
            {t.pricing.sub}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <div
                key={i}
                className={`relative rounded-3xl p-7 transition-all duration-300 ${
                  plan.highlight
                    ? "shadow-2xl shadow-[oklch(0.76_0.18_148/0.3)] scale-105"
                    : "hover:shadow-xl hover:-translate-y-1"
                }`}
                style={{
                  background: plan.highlight
                    ? "linear-gradient(135deg, oklch(0.52 0.12 180), oklch(0.68 0.16 148))"
                    : "oklch(0.97 0.003 100)",
                  border: plan.highlight
                    ? "none"
                    : "1px solid oklch(0.90 0.005 100)",
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? plan.highlight ? "scale(1.05)" : "translateY(0)"
                    : "translateY(40px)",
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.23,1,0.32,1) ${i * 0.1}s, box-shadow 0.2s ease`,
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                    style={{ background: "oklch(0.14 0.01 250)", color: "white" }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: plan.highlight ? "oklch(1 0 0 / 0.2)" : "oklch(0.76 0.18 148 / 0.1)",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: plan.highlight ? "white" : "oklch(0.52 0.12 148)" }}
                    />
                  </div>
                  <h3
                    className={`font-bold text-lg ${plan.highlight ? "text-white" : "text-[oklch(0.14_0.01_250)]"}`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-[oklch(0.14_0.01_250)]"}`}
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      ${plan.price}
                    </span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? "text-white/70" : "text-[oklch(0.55_0.01_80)]"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.highlight ? "text-white/80" : "text-[oklch(0.55_0.01_80)]"}`}>
                    {plan.description}
                  </p>
                </div>

                <Button
                  className={`w-full mb-6 font-bold h-11 active:scale-[0.97] transition-transform ${
                    plan.highlight
                      ? "bg-white text-[oklch(0.14_0.01_250)] hover:bg-white/90"
                      : ""
                  }`}
                  style={!plan.highlight ? {
                    background: "oklch(0.76 0.18 148)",
                    color: "oklch(0.08 0.02 148)",
                  } : {}}
                  onClick={() => navigate("/register")}
                >
                  {plan.cta}
                </Button>

                <div className="flex flex-col gap-2.5">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2
                          size={15}
                          className="flex-shrink-0"
                          style={{ color: plan.highlight ? "white" : "oklch(0.76 0.18 148)" }}
                        />
                      ) : (
                        <X
                          size={15}
                          className="flex-shrink-0"
                          style={{ color: plan.highlight ? "oklch(1 0 0 / 0.3)" : "oklch(0.75 0.01 80)" }}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? plan.highlight ? "text-white" : "text-[oklch(0.35_0.01_80)]"
                            : plan.highlight ? "text-white/40" : "text-[oklch(0.70_0.01_80)]"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-[oklch(0.60_0.01_80)] text-sm mt-8">
          Todos los precios en USD. Impuestos locales pueden aplicar.{" "}
          <span style={{ color: "oklch(0.52 0.12 148)", fontWeight: 600 }}>
            14 días de prueba gratis
          </span>{" "}
          en todos los planes.
        </p>
      </div>
    </section>
  );
}
