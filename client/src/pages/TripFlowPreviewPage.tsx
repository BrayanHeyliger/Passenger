import { useState } from "react";
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CreditCard,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

type FlowStep = 0 | 1 | 2 | 3 | 4;

const stages = [
  {
    title: "Solicita tu viaje",
    eyebrow: "01 · SOLICITUD",
    caption: "Elige origen, destino y el tipo de servicio que necesitas.",
  },
  {
    title: "Conductor asignado",
    eyebrow: "02 · ASIGNACIÓN",
    caption: "Conoce quién te recoge antes de que llegue.",
  },
  {
    title: "Tu viaje está en curso",
    eyebrow: "03 · EN RUTA",
    caption: "Sigue el vehículo y la ruta en tiempo real.",
  },
  {
    title: "Llegaste con seguridad",
    eyebrow: "04 · LLEGADA",
    caption: "Confirma el total y selecciona el método de pago.",
  },
  {
    title: "Califica tu experiencia",
    eyebrow: "05 · FINALIZADO",
    caption: "Una valoración rápida mejora cada próximo viaje.",
  },
] as const;

function MiniTripMap({ step }: { step: FlowStep }) {
  const carPosition =
    step === 1
      ? "translate(198 350)"
      : step === 2
        ? "translate(430 267)"
        : step >= 3
          ? "translate(724 170)"
          : "translate(120 388)";
  return (
    <div className="flow-mini-map" aria-label="Vista previa de ruta">
      <svg viewBox="0 0 900 530" role="img" aria-label="Ruta de viaje">
        <defs>
          <filter id="flowGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="900" height="530" fill="#08151d" />
        {Array.from({ length: 9 }, (_, index) => (
          <path
            key={`h-${index}`}
            d={`M0 ${55 + index * 55} C 170 ${18 + index * 55} 290 ${115 + index * 44} 460 ${55 + index * 51} S 710 ${25 + index * 48} 900 ${63 + index * 46}`}
            fill="none"
            stroke={index % 2 ? "#142933" : "#1a303a"}
            strokeWidth={index % 2 ? 2 : 4}
          />
        ))}
        {[80, 190, 310, 430, 570, 700, 820].map((x, index) => (
          <path
            key={`v-${x}`}
            d={`M${x} 0 C ${x - 35} 160 ${x + 45} 308 ${x - 15} 530`}
            fill="none"
            stroke={index % 2 ? "#152a34" : "#203843"}
            strokeWidth="2.5"
          />
        ))}
        <path
          d="M120 388 C 208 418 276 390 350 337 S 460 304 523 252 S 645 236 724 170"
          fill="none"
          stroke="#0c3323"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M120 388 C 208 418 276 390 350 337 S 460 304 523 252 S 645 236 724 170"
          fill="none"
          stroke="#52e89b"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#flowGlow)"
        />
        <circle
          cx="120"
          cy="388"
          r="21"
          fill="#07181a"
          stroke="#51e498"
          strokeWidth="6"
        />
        <circle cx="120" cy="388" r="7" fill="#effff6" />
        <circle
          cx="724"
          cy="170"
          r="20"
          fill="#0a171c"
          stroke="#ff827a"
          strokeWidth="6"
        />
        <circle cx="724" cy="170" r="6" fill="#fff7f5" />
        <g transform={carPosition} className="flow-map-car">
          <ellipse cx="0" cy="10" rx="27" ry="7" fill="#000" opacity=".5" />
          <path
            d="M-28 1 L-18 -12 L16 -12 L29 1 L27 10 L-27 10 Z"
            fill="#edf6f4"
            stroke="#91a5a7"
            strokeWidth="2"
          />
          <path
            d="M-13 -12 L-7 -21 L12 -21 L21 -12"
            fill="#26383f"
            stroke="#cce0e0"
            strokeWidth="1.5"
          />
          <circle cx="-17" cy="11" r="5" fill="#0e171b" />
          <circle cx="18" cy="11" r="5" fill="#0e171b" />
        </g>
      </svg>
      <span className="flow-map-label flow-map-label--one">JUÁREZ</span>
      <span className="flow-map-label flow-map-label--two">ROMA NORTE</span>
      <span className="flow-map-label flow-map-label--three">DOCTORES</span>
      {step === 2 && (
        <div className="flow-eta-card">
          <span>Llegada en</span>
          <strong>4 min</strong>
          <small>1.2 km</small>
        </div>
      )}
    </div>
  );
}

function StageContent({ step }: { step: FlowStep }) {
  if (step === 0)
    return (
      <div className="flow-stage-card flow-request-card">
        <div className="flow-input">
          <MapPin size={19} />
          <span>
            <small>RECÓGEME EN</small>Av. Reforma 222, Juárez
          </span>
        </div>
        <div className="flow-input">
          <Navigation size={19} />
          <span>
            <small>VOY A</small>Aeropuerto Internacional (AICM)
          </span>
        </div>
        <div className="flow-service-row">
          <button className="is-selected">
            <Car size={19} />
            <span>
              Estándar<small>4 min · $115</small>
            </span>
          </button>
          <button>
            <Car size={19} />
            <span>
              XL<small>6 min · $168</small>
            </span>
          </button>
        </div>
        <button
          onClick={() => toast.success("Buscando conductor disponible")}
          className="flow-primary"
        >
          Confirmar y buscar conductor
        </button>
      </div>
    );
  if (step === 1)
    return (
      <div className="flow-stage-card flow-driver-assign">
        <div className="flow-success-ring">
          <UserRoundCheck size={31} />
        </div>
        <span className="flow-status-label">CONDUCTOR VERIFICADO</span>
        <h3>Mateo Rivera acepta tu viaje</h3>
        <p>Está a 1.2 km y se dirige a tu punto de recogida.</p>
        <div className="flow-driver-summary">
          <span className="flow-avatar">MR</span>
          <span>
            <b>Mateo Rivera</b>
            <small>★ 4.9 · Más de 1,200 viajes</small>
            <small>Toyota Corolla · ABC-123</small>
          </span>
          <button onClick={() => toast.info("Perfil del conductor abierto")}>
            Ver perfil
          </button>
        </div>
        <button
          onClick={() => toast.info("Contacto seguro habilitado")}
          className="flow-secondary"
        >
          Contactar conductor
        </button>
      </div>
    );
  if (step === 2)
    return (
      <div className="flow-stage-card flow-live-card">
        <div className="flow-live-line">
          <span className="flow-pulse" /> EN VIVO{" "}
          <small>Actualizado hace 2 segundos</small>
        </div>
        <h3>Todo va según lo planeado</h3>
        <p>El conductor está recorriendo la ruta hacia el destino.</p>
        <div className="flow-timeline">
          <span className="done">
            <Check size={13} />
            <b>Solicitud</b>
            <small>Completada</small>
          </span>
          <span className="done">
            <Check size={13} />
            <b>Aceptado</b>
            <small>Completado</small>
          </span>
          <span className="active">
            <Car size={15} />
            <b>En camino</b>
            <small>En progreso</small>
          </span>
          <span>
            <i />
            <b>Llegada</b>
            <small>Pendiente</small>
          </span>
        </div>
        <button
          onClick={() => toast.success("Enlace de seguimiento compartido")}
          className="flow-secondary"
        >
          Compartir mi viaje
        </button>
      </div>
    );
  if (step === 3)
    return (
      <div className="flow-stage-card flow-payment-card">
        <div className="flow-success-ring">
          <CircleCheck size={31} />
        </div>
        <span className="flow-status-label">VIAJE COMPLETADO</span>
        <h3>Gracias por viajar con nosotros</h3>
        <p>Has llegado a Aeropuerto Internacional (AICM).</p>
        <div className="flow-total">
          <span>Total del viaje</span>
          <strong>$115.00</strong>
          <small>Tarifa final · sin cargos ocultos</small>
        </div>
        <div className="flow-payment-method">
          <WalletCards size={20} />
          <span>Visa terminada en 4821</span>
          <Check size={18} />
        </div>
        <button
          onClick={() => toast.success("Pago procesado correctamente")}
          className="flow-primary"
        >
          Pagar $115.00
        </button>
      </div>
    );
  return (
    <div className="flow-stage-card flow-rating-card">
      <div className="flow-success-ring">
        <ShieldCheck size={31} />
      </div>
      <span className="flow-status-label">TU OPINIÓN CUENTA</span>
      <h3>¿Cómo estuvo tu viaje con Mateo?</h3>
      <p>
        Una valoración toma segundos y ayuda a mantener la calidad de
        UnPasajero.Com.
      </p>
      <div className="flow-stars">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() =>
              toast.success(`Calificación de ${n} estrellas registrada`)
            }
          >
            <Star size={32} fill="currentColor" />
          </button>
        ))}
      </div>
      <textarea placeholder="Cuéntanos algún detalle opcional…" />
      <button
        onClick={() => toast.success("Gracias por tu calificación")}
        className="flow-primary"
      >
        Finalizar experiencia
      </button>
    </div>
  );
}

export default function TripFlowPreviewPage() {
  const [step, setStep] = useState<FlowStep>(0);
  const previous = () => setStep(value => Math.max(0, value - 1) as FlowStep);
  const next = () => setStep(value => Math.min(4, value + 1) as FlowStep);
  return (
    <main className="trip-flow-preview min-h-screen">
      <header className="trip-flow-header">
        <a href="/" className="trip-flow-brand">
          <span>P</span>
          <b>
            Passenger<small>MOBILITY PLATFORM</small>
          </b>
        </a>
        <p>Demostración de experiencia del pasajero</p>
        <a href="/trip-tracking">Ver viaje en curso</a>
      </header>
      <section className="trip-flow-stage-nav">
        {stages.map((item, index) => (
          <button
            key={item.title}
            onClick={() => setStep(index as FlowStep)}
            className={
              index === step ? "is-current" : index < step ? "is-complete" : ""
            }
          >
            <span>{index < step ? <Check size={14} /> : index + 1}</span>
            {item.title}
          </button>
        ))}
      </section>
      <section className="trip-flow-main">
        <div className="trip-flow-copy">
          <p className="trip-flow-eyebrow">{stages[step].eyebrow}</p>
          <h1>{stages[step].title}</h1>
          <p>{stages[step].caption}</p>
          <div className="trip-flow-pagination">
            <button onClick={previous} disabled={step === 0}>
              <ChevronLeft size={20} />
              Anterior
            </button>
            <span>
              {String(step + 1).padStart(2, "0")} <i /> 05
            </span>
            <button onClick={next} disabled={step === 4}>
              Siguiente
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="trip-flow-visual">
          <MiniTripMap step={step} />
          <StageContent step={step} />
        </div>
      </section>
    </main>
  );
}
