/**
 * ContactSection — WhatsApp Taxi SaaS
 * Design: Verde Operacional — dark bg, formulario de contacto + info
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }
    setSubmitted(true);
    toast.success("¡Mensaje enviado! Te contactaremos pronto.");
  };

  return (
    <section
      id="contact"
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, oklch(0.13 0.01 250) 0%, oklch(0.10 0.01 250) 100%)" }}
    >
      {/* Glow */}
      <div
        className="absolute bottom-0 right-0 w-96 h-96 opacity-10 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.76 0.18 148)" }}
      />

      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "oklch(0.76 0.18 148 / 0.15)", color: "oklch(0.76 0.18 148)" }}
          >
            <Mail size={12} />
            Contacto
          </div>
          <h2
            className="text-3xl lg:text-4xl font-extrabold text-white mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ¿Listo para{" "}
            <span style={{ color: "oklch(0.76 0.18 148)" }}>transformar tu flota?</span>
          </h2>
          <p className="text-white/60 text-lg">
            Habla con nuestro equipo y activa tu plataforma en menos de 48 horas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact info */}
          <div className="flex flex-col gap-8">
            <div>
              <h3
                className="text-white font-bold text-xl mb-6"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Información de contacto
              </h3>
              <div className="flex flex-col gap-5">
                {[
                  { icon: MessageCircle, label: "WhatsApp directo", value: "+1 (555) 000-0000", color: "oklch(0.76 0.18 148)" },
                  { icon: Mail, label: "Email", value: "hola@whatsapptaxi.com", color: "oklch(0.65 0.15 250)" },
                  { icon: Phone, label: "Teléfono", value: "+1 (555) 000-0001", color: "oklch(0.65 0.12 30)" },
                  { icon: MapPin, label: "Oficina", value: "Ciudad de México, México", color: "oklch(0.65 0.15 30)" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}20` }}
                      >
                        <Icon size={18} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">{item.label}</p>
                        <p className="text-white font-medium text-sm">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "oklch(0.18 0.01 250)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}
            >
              <h4
                className="text-white font-semibold text-sm mb-4"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                ¿Por qué elegirnos?
              </h4>
              {[
                "Activación en menos de 48 horas",
                "Sin contrato mínimo de permanencia",
                "Soporte técnico 24/7 en español",
                "Integración con tu número de WhatsApp existente",
                "Migración de datos sin costo adicional",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-2.5">
                  <CheckCircle2 size={14} style={{ color: "oklch(0.76 0.18 148)" }} className="flex-shrink-0" />
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div
            className="rounded-3xl p-7"
            style={{ background: "oklch(0.18 0.01 250)", border: "1px solid oklch(1 0 0 / 0.1)" }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.76 0.18 148 / 0.2)" }}
                >
                  <CheckCircle2 size={32} style={{ color: "oklch(0.76 0.18 148)" }} />
                </div>
                <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
                  ¡Mensaje recibido!
                </h3>
                <p className="text-white/60 text-sm max-w-xs">
                  Nuestro equipo te contactará en menos de 24 horas para activar tu plataforma.
                </p>
                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white mt-2"
                  onClick={() => setSubmitted(false)}
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3
                  className="text-white font-bold text-lg mb-2"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Solicitar demo gratuita
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-white/70 text-xs">Nombre *</Label>
                    <Input
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="bg-[oklch(0.22_0.01_250)] border-[oklch(1_0_0/0.1)] text-white placeholder:text-white/30 focus:border-[oklch(0.76_0.18_148/0.5)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-white/70 text-xs">Email *</Label>
                    <Input
                      type="email"
                      placeholder="tu@empresa.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-[oklch(0.22_0.01_250)] border-[oklch(1_0_0/0.1)] text-white placeholder:text-white/30 focus:border-[oklch(0.76_0.18_148/0.5)]"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-white/70 text-xs">Empresa / Flota</Label>
                  <Input
                    placeholder="Nombre de tu empresa de taxi"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="bg-[oklch(0.22_0.01_250)] border-[oklch(1_0_0/0.1)] text-white placeholder:text-white/30 focus:border-[oklch(0.76_0.18_148/0.5)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-white/70 text-xs">Mensaje</Label>
                  <Textarea
                    placeholder="Cuéntanos sobre tu flota y necesidades..."
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="bg-[oklch(0.22_0.01_250)] border-[oklch(1_0_0/0.1)] text-white placeholder:text-white/30 focus:border-[oklch(0.76_0.18_148/0.5)] resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold h-12 mt-2 active:scale-[0.97] transition-transform shadow-lg shadow-green-500/20"
                  style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}
                >
                  <Send size={16} className="mr-2" />
                  Solicitar demo gratuita
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
