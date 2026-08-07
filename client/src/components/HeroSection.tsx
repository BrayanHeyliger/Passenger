/**
 * HeroSection — WhatsApp Taxi SaaS
 * Design: Verde Operacional — dark charcoal bg, green gradient, floating WhatsApp mockup
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, CheckCircle2, MessageCircle, MapPin, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

const stats = [
  { value: "2,400+", label: "Empresas activas" },
  { value: "1.2M+", label: "Viajes procesados" },
  { value: "99.9%", label: "Uptime garantizado" },
  { value: "48h", label: "Tiempo de activación" },
];

const chatMessages = [
  { type: "received", text: "¡Hola! Soy TaxiBot 🚕\n¿A dónde te llevo hoy?", time: "10:30" },
  { type: "sent", text: "📍 Av. Corrientes 1234, CABA", time: "10:31" },
  { type: "received", text: "Perfecto. ¿Cuál es tu destino?", time: "10:31" },
  { type: "sent", text: "Aeropuerto Ezeiza", time: "10:32" },
  { type: "received", text: "🗺️ Ruta calculada\n📏 Distancia: 42 km\n⏱️ Tiempo: ~55 min\n💰 Tarifa estimada: $3,200", time: "10:32" },
];

export default function HeroSection() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [, navigate] = useLocation();
  const { config } = useSiteConfig();

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev < chatMessages.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${config.secondaryColor}f0 0%, ${config.secondaryColor}cc 50%, ${config.secondaryColor}f0 100%)`,
      }}
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/manus-storage/hero-bg_8ad9c612.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Green glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.76 0.18 148)" }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.52 0.12 180)" }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(oklch(0.76 0.18 148 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.76 0.18 148 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Badge
                className="px-3 py-1.5 text-xs font-semibold border-0"
                style={{
                  background: "oklch(0.76 0.18 148 / 0.15)",
                  color: "oklch(0.76 0.18 148)",
                  border: "1px solid oklch(0.76 0.18 148 / 0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.76_0.18_148)] mr-2 animate-pulse inline-block" />
                Plataforma SaaS Multitenant
              </Badge>
            </div>

            <h1
              className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}
            >
              {config.heroTitle.split(".")[0]}{" "}
              <span
                className="relative"
                style={{
                  background: `linear-gradient(90deg, ${config.primaryColor}, ${config.accentColor})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {config.heroTitle.split(".")[1] || "desde WhatsApp"}
              </span>
              <br />
              <span className="text-white/80">{config.heroTitle.split(".")[2] || "Sin apps. Sin complicaciones."}</span>
            </h1>

            <p className="text-white/60 text-lg leading-relaxed max-w-lg">
              {config.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="text-base font-bold px-8 h-12 shadow-xl shadow-green-500/30 active:scale-[0.97] transition-all"
                style={{
                  background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
                  color: "#0d1117",
                }}
                onClick={() => navigate("/register")}
              >
                {config.ctaText}
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base font-semibold px-8 h-12 border-white/20 text-white hover:bg-white/10 hover:border-white/30 active:scale-[0.97] transition-all"
                onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Play size={16} className="mr-2" />
                Ver demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {["Sin contrato mínimo", "Activación en 48h", "Soporte 24/7"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/60 text-sm">
                  <CheckCircle2 size={14} className="text-[oklch(0.76_0.18_148)] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: WhatsApp Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="animate-float relative">
              {/* Phone frame */}
              <div
                className="relative w-72 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50"
                style={{
                  background: "oklch(0.12 0.01 250)",
                  border: "2px solid oklch(0.25 0.01 250)",
                }}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 py-3 bg-[oklch(0.10_0.01_250)]">
                  <span className="text-white text-xs font-medium">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 rounded-sm bg-white/60" />
                    <div className="w-1 h-2 rounded-sm bg-white/60" />
                  </div>
                </div>

                {/* WhatsApp header */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: "oklch(0.52 0.12 180)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "oklch(0.76 0.18 148)" }}
                  >
                    🚕
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">TaxiBot</p>
                    <p className="text-white/70 text-xs">En línea</p>
                  </div>
                </div>

                {/* Chat messages */}
                <div
                  className="px-3 py-4 min-h-80 flex flex-col gap-2"
                  style={{
                    background: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=300&q=30') center/cover",
                    backgroundColor: "oklch(0.93 0.005 148 / 0.9)",
                  }}
                >
                  {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"} animate-fade-up`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 text-xs shadow-sm ${
                          msg.type === "sent" ? "chat-bubble-sent" : "chat-bubble-received"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.type === "sent" ? "text-black/40" : "text-gray-400"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Confirm buttons */}
                  {visibleMessages >= chatMessages.length && (
                    <div className="flex flex-col gap-1.5 mt-2 animate-fade-up">
                      <button
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform"
                        style={{ background: "oklch(0.76 0.18 148)" }}
                      >
                        ✅ Confirmar viaje
                      </button>
                      <button className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/80 text-gray-600 shadow-sm">
                        ❌ Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="flex items-center gap-2 px-3 py-3 bg-[oklch(0.96_0.005_100)]">
                  <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-gray-400 shadow-sm">
                    Escribe un mensaje...
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: "oklch(0.76 0.18 148)" }}
                  >
                    ➤
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div
                className="absolute -left-16 top-16 glass-card rounded-2xl px-3 py-2 shadow-xl animate-float"
                style={{ animationDelay: "1s", background: "oklch(0.18 0.01 250 / 0.9)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[oklch(0.76_0.18_148)] flex items-center justify-center">
                    <MapPin size={12} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-[10px] font-semibold">Conductor asignado</p>
                    <p className="text-white/50 text-[9px]">Carlos M. — 3 min</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -right-12 bottom-24 glass-card rounded-2xl px-3 py-2 shadow-xl animate-float"
                style={{ animationDelay: "2s", background: "oklch(0.18 0.01 250 / 0.9)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}
              >
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <div>
                    <p className="text-white text-[10px] font-semibold">4.9 / 5.0</p>
                    <p className="text-white/50 text-[9px]">Satisfacción</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 pt-10 border-t"
          style={{ borderColor: "oklch(1 0 0 / 0.1)" }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center lg:text-left">
              <p
                className="text-2xl lg:text-3xl font-extrabold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-white/50 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
