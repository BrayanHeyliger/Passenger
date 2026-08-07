/**
 * TestimonialsSection — WhatsApp Taxi SaaS
 * Muestra los testimonios configurados desde el panel admin
 */
import { useSiteConfig } from "@/contexts/SiteConfigContext";

export default function TestimonialsSection() {
  const { config } = useSiteConfig();
  const testimonials = (config as any).testimonials || [];

  if (!config.showTestimonials || testimonials.length === 0) return null;

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "oklch(0.11 0.01 250)" }}
    >
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, oklch(0.76 0.18 148), transparent)" }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{
              background: "oklch(0.76 0.18 148 / 0.12)",
              borderColor: "oklch(0.76 0.18 148 / 0.3)",
              color: "oklch(0.76 0.18 148)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Testimonios
          </div>
          <h2
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}
          >
            Lo que dicen nuestros{" "}
            <span style={{ color: "oklch(0.76 0.18 148)" }}>clientes</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Empresas de taxi que ya transformaron su operación con WhatsApp Taxi SaaS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t: any) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl border flex flex-col gap-4 hover:border-green-500/40 transition-colors"
              style={{
                background: "oklch(0.14 0.01 250)",
                borderColor: "oklch(1 0 0 / 0.08)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className="text-lg"
                    style={{ color: star <= (t.rating || 5) ? "#FBBF24" : "oklch(1 0 0 / 0.15)" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Text */}
              <p className="text-white/70 text-sm leading-relaxed flex-1">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "oklch(1 0 0 / 0.08)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "oklch(0.76 0.18 148)" }}
                >
                  {t.name ? t.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name || "Cliente"}</p>
                  <p className="text-white/40 text-xs">{t.company || ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
