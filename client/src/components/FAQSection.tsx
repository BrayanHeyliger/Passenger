/**
 * FAQSection — Preguntas Frecuentes con acordeón animado
 * Cubre: mascotas, aeropuerto, sillas para niños, métodos de pago, seguridad, etc.
 */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";

const faqCategories = [
  {
    category: "🚕 Sobre el servicio",
    color: "oklch(0.76 0.18 148)",
    questions: [
      {
        q: "¿Cuánto tiempo tarda en llegar el taxi?",
        a: "En zonas urbanas, el tiempo promedio de llegada es de 3 a 8 minutos. Recibirás una notificación por WhatsApp con el tiempo estimado exacto una vez que el conductor acepte tu viaje.",
      },
      {
        q: "¿Hacen viajes al aeropuerto?",
        a: "Sí, realizamos traslados al aeropuerto las 24 horas, los 7 días de la semana. Recomendamos reservar con al menos 2 horas de anticipación para vuelos. El precio incluye espera de hasta 15 minutos en la terminal.",
      },
      {
        q: "¿Puedo reservar un taxi con anticipación?",
        a: "Sí, puedes programar tu viaje con hasta 72 horas de anticipación. Solo indica la fecha y hora de recogida en el mensaje de WhatsApp y un operador confirmará la reserva.",
      },
      {
        q: "¿El servicio está disponible las 24 horas?",
        a: "Sí, operamos las 24 horas del día, los 365 días del año, incluyendo feriados. En horario nocturno (10pm–6am) puede aplicar un recargo del 20%.",
      },
    ],
  },
  {
    category: "🐾 Mascotas y necesidades especiales",
    color: "oklch(0.65 0.15 80)",
    questions: [
      {
        q: "¿Aceptan mascotas en el taxi?",
        a: "Sí, aceptamos mascotas pequeñas y medianas que viajen en transportín o jaula. Para mascotas grandes, consulta disponibilidad al solicitar el viaje. Por favor indícalo al hacer la reserva para asignar un conductor que lo permita.",
      },
      {
        q: "¿Tienen sillas para bebés o niños?",
        a: "Sí, contamos con sillas para bebés (0-13 kg) y sillas elevadoras para niños (15-36 kg). Solicítala al reservar con al menos 1 hora de anticipación. Hay un costo adicional de $2 por uso.",
      },
      {
        q: "¿Pueden transportar personas con movilidad reducida?",
        a: "Sí, disponemos de vehículos adaptados para personas con silla de ruedas. Selecciona la opción 'Accesible' al reservar o indícalo en el mensaje de WhatsApp.",
      },
    ],
  },
  {
    category: "💳 Pagos y tarifas",
    color: "oklch(0.65 0.15 250)",
    questions: [
      {
        q: "¿Cuáles son los métodos de pago aceptados?",
        a: "Aceptamos: efectivo, tarjeta de crédito/débito (Visa, Mastercard), Zelle, transferencia bancaria y pago móvil. El conductor siempre confirmará el método antes de iniciar el viaje.",
      },
      {
        q: "¿Cómo se calcula la tarifa?",
        a: "La tarifa se calcula en base a la distancia (costo por km), tiempo estimado del viaje y el tipo de vehículo seleccionado. Recibirás el precio estimado antes de confirmar el viaje, sin sorpresas.",
      },
      {
        q: "¿Hay cargos adicionales?",
        a: "Pueden aplicar recargos por: horario nocturno (+20%), días feriados (+15%), equipaje extra (+$2), espera superior a 5 minutos (+$0.50/min) y peajes (se cobran al costo real).",
      },
      {
        q: "¿Puedo obtener un recibo o factura?",
        a: "Sí, al finalizar el viaje recibirás automáticamente un resumen por WhatsApp con el detalle del recorrido y el monto cobrado. Para facturas fiscales, contáctanos al correo de soporte.",
      },
    ],
  },
  {
    category: "🔒 Seguridad y confianza",
    color: "oklch(0.65 0.15 148)",
    questions: [
      {
        q: "¿Cómo sé que el conductor es de confianza?",
        a: "Todos nuestros conductores pasan por verificación de antecedentes penales, revisión de licencia de conducir vigente y evaluación de vehículo. Además, recibirás foto, nombre y placa del conductor antes de que llegue.",
      },
      {
        q: "¿Qué pasa si tengo un problema durante el viaje?",
        a: "Puedes usar el botón SOS en la app o enviar 'EMERGENCIA' por WhatsApp para contactar a nuestro equipo de seguridad 24/7. También puedes compartir tu viaje en tiempo real con un familiar.",
      },
      {
        q: "¿Puedo cancelar mi viaje?",
        a: "Sí, puedes cancelar sin costo hasta 2 minutos después de confirmar. Si el conductor ya está en camino, puede aplicar un cargo de cancelación de $1. Escribe 'CANCELAR' por WhatsApp para cancelar.",
      },
    ],
  },
];

function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: isOpen ? "1px solid oklch(0.76 0.18 148 / 0.4)" : "1px solid oklch(0.90 0.005 100)",
        background: isOpen ? "oklch(0.97 0.005 148 / 0.4)" : "white",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-all"
      >
        <span
          className="font-semibold text-sm text-[oklch(0.14_0.01_250)] leading-snug"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {question}
        </span>
        <ChevronDown
          size={18}
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            color: "oklch(0.52 0.12 148)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "400px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-5 pb-4">
          <div
            className="w-full h-px mb-3"
            style={{ background: "oklch(0.76 0.18 148 / 0.2)" }}
          />
          <p className="text-[oklch(0.45_0.01_80)] text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>("0-0");
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

  const handleToggle = (key: string) => {
    setOpenItem(openItem === key ? null : key);
  };

  return (
    <section
      id="faq"
      className="py-20 lg:py-28 bg-white"
      ref={ref}
    >
      <div className="container">
        {/* Header */}
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
            <HelpCircle size={12} />
            Preguntas frecuentes
          </div>
          <h2
            className="text-3xl lg:text-4xl font-extrabold text-[oklch(0.14_0.01_250)] mb-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Todo lo que necesitas{" "}
            <span style={{ color: "oklch(0.52 0.12 148)" }}>saber</span>
          </h2>
          <p className="text-[oklch(0.55_0.01_80)] text-lg">
            Respuestas rápidas a las preguntas más comunes de nuestros clientes.
          </p>
        </div>

        {/* Categories grid */}
        <div
          className="grid lg:grid-cols-2 gap-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(0.23,1,0.32,1) 0.1s",
          }}
        >
          {faqCategories.map((cat, catIdx) => (
            <div key={catIdx}>
              {/* Category label */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-0.5 w-6 rounded-full"
                  style={{ background: cat.color }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: cat.color, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {cat.category}
                </span>
              </div>
              {/* Questions */}
              <div className="flex flex-col gap-2">
                {cat.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  return (
                    <AccordionItem
                      key={key}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItem === key}
                      onToggle={() => handleToggle(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-14 text-center p-8 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, oklch(0.13 0.01 250), oklch(0.16 0.02 200))",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease 0.2s",
          }}
        >
          <p className="text-white/70 text-sm mb-3">¿No encontraste la respuesta que buscabas?</p>
          <p
            className="text-white font-bold text-lg mb-5"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Escríbenos directamente por WhatsApp
          </p>
          <a
            href="https://wa.me/?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20el%20servicio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))",
              boxShadow: "0 8px 24px oklch(0.52 0.12 148 / 0.4)",
            }}
          >
            <MessageCircle size={18} />
            Hacer una pregunta por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
