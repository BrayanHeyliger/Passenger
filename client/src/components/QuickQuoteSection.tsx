/**
 * QuickQuoteSection — Sección del landing con el mini formulario de cotización rápida
 */
import { useRef, useState, useEffect } from "react";
import { Zap, Shield, Clock } from "lucide-react";
import QuickQuoteForm from "./QuickQuoteForm";

export default function QuickQuoteSection() {
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
      id="cotizacion"
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, oklch(0.96 0.005 148 / 0.3) 0%, white 100%)" }}
    >
      {/* Background decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-5 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.52 0.12 148)" }}
      />

      <div className="container relative z-10" ref={ref}>
        <div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
              style={{ background: "oklch(0.76 0.18 148 / 0.12)", color: "oklch(0.52 0.12 148)" }}
            >
              <Zap size={12} />
              Cotización instantánea
            </div>
            <h2
              className="text-3xl lg:text-4xl font-extrabold text-[oklch(0.14_0.01_250)] mb-4 leading-tight"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Tu taxi en{" "}
              <span style={{ color: "oklch(0.52 0.12 148)" }}>menos de 5 minutos</span>
              {" "}a un clic por WhatsApp
            </h2>
            <p className="text-[oklch(0.55_0.01_80)] text-lg mb-8 leading-relaxed">
              Completa el formulario y recibe una cotización inmediata directamente en tu WhatsApp. Sin llamadas, sin esperas, sin complicaciones.
            </p>

            {/* Trust points */}
            <div className="flex flex-col gap-4">
              {[
                { icon: Zap, color: "oklch(0.76 0.18 148)", title: "Respuesta en menos de 2 minutos", desc: "Un operador confirmará tu viaje al instante" },
                { icon: Shield, color: "oklch(0.65 0.15 250)", title: "Choferes verificados y seguros", desc: "Todos nuestros conductores pasan verificación de antecedentes" },
                { icon: Clock, color: "oklch(0.65 0.15 80)", title: "Disponible 24/7 los 365 días", desc: "Servicio continuo sin importar el horario" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-[oklch(0.14_0.01_250)] font-semibold text-sm">{item.title}</p>
                      <p className="text-[oklch(0.55_0.01_80)] text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment methods */}
            <div className="mt-8 p-4 rounded-2xl" style={{ background: "oklch(0.97 0.005 148 / 0.5)", border: "1px solid oklch(0.90 0.005 100)" }}>
              <p className="text-[oklch(0.55_0.01_80)] text-xs font-semibold uppercase tracking-wider mb-3">
                💳 Métodos de pago aceptados
              </p>
              <div className="flex flex-wrap gap-2">
                {["💵 Efectivo", "💳 Tarjeta", "📱 Zelle", "🏦 Transferencia", "📲 Pago Móvil"].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[oklch(0.35_0.01_250)]"
                    style={{ background: "white", border: "1px solid oklch(0.90 0.005 100)" }}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <QuickQuoteForm />
          </div>
        </div>
      </div>
    </section>
  );
}
