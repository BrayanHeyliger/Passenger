import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CarFront,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  CreditCard,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import "./ride-selection-proposal.css";

type RideId = "economy" | "comfort" | "xl";

const rides = [
  {
    id: "economy" as RideId,
    name: "UnPasajero",
    subtitle: "El viaje que necesitas, sin complicaciones.",
    eta: "4 min",
    price: "$115",
    icon: CarFront,
    tag: "MÁS ELEGIDO",
    capacity: "Hasta 4 personas",
  },
  {
    id: "comfort" as RideId,
    name: "Comfort",
    subtitle: "Más espacio y una llegada más tranquila.",
    eta: "6 min",
    price: "$148",
    icon: Sparkles,
    tag: "VIAJE PREMIUM",
    capacity: "Vehículos con mayor espacio",
  },
  {
    id: "xl" as RideId,
    name: "UnPasajero XL",
    subtitle: "Cuando viajan más personas o más cosas.",
    eta: "8 min",
    price: "$189",
    icon: UsersRound,
    tag: "PARA GRUPOS",
    capacity: "Hasta 6 personas",
  },
];

function RoutePreview() {
  return (
    <section className="ride-route-preview" aria-label="Resumen de ruta">
      <div className="ride-route-topline">
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <span>Estás a un paso de tu viaje</span>
        <button type="button" aria-label="Más opciones">
          <ChevronDown size={20} />
        </button>
      </div>
      <div className="ride-route-map">
        <svg viewBox="0 0 720 600" role="img" aria-label="Ruta prevista">
          <defs>
            <filter id="rideRouteGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="720" height="600" fill="#08151d" />
          {Array.from({ length: 10 }, (_, index) => (
            <path
              key={`h-${index}`}
              d={`M0 ${24 + index * 64} C150 ${65 + index * 53} 260 ${-12 + index * 66} 425 ${52 + index * 55} S570 ${7 + index * 68} 720 ${48 + index * 57}`}
              fill="none"
              stroke={index % 2 ? "#152c36" : "#203a45"}
              strokeWidth={index % 2 ? 2 : 3.5}
            />
          ))}
          {[67, 158, 275, 375, 482, 598, 675].map((x, index) => (
            <path
              key={`v-${x}`}
              d={`M${x} 0 C ${x - 40} 160 ${x + 55} 330 ${x - 16} 600`}
              fill="none"
              stroke={index % 2 ? "#172e38" : "#203b46"}
              strokeWidth="2.5"
            />
          ))}
          <path
            d="M138 424 C223 438 268 387 338 335 S447 316 498 260 S553 213 606 150"
            fill="none"
            stroke="#123a2b"
            strokeWidth="19"
            strokeLinecap="round"
          />
          <path
            d="M138 424 C223 438 268 387 338 335 S447 316 498 260 S553 213 606 150"
            fill="none"
            stroke="#51e49a"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#rideRouteGlow)"
          />
          <circle
            cx="138"
            cy="424"
            r="23"
            fill="#09231f"
            stroke="#52e49a"
            strokeWidth="5"
          />
          <circle cx="138" cy="424" r="8" fill="#f6fff9" />
          <circle
            cx="606"
            cy="150"
            r="22"
            fill="#271414"
            stroke="#ff827a"
            strokeWidth="5"
          />
          <circle cx="606" cy="150" r="8" fill="#fff7f5" />
        </svg>
        <span className="ride-map-area ride-map-area--one">DOWNTOWN</span>
        <span className="ride-map-area ride-map-area--two">LAKE EOLA</span>
        <span className="ride-map-area ride-map-area--three">MILLS 50</span>
        <span className="ride-eta-chip">
          <Clock3 size={15} />
          <b>12 min</b>
          <small>Hasta el destino</small>
        </span>
      </div>
      <div className="ride-route-addresses">
        <span>
          <i className="ride-origin">
            <CircleDot size={18} />
          </i>
          <b>Lake Eola Park, Orlando, FL</b>
          <small>Punto de recogida</small>
        </span>
        <span>
          <i className="ride-destination">
            <Navigation size={18} />
          </i>
          <b>Orlando International Airport (MCO)</b>
          <small>Destino</small>
        </span>
      </div>
    </section>
  );
}

export default function RideSelectionProposalPage() {
  const [selected, setSelected] = useState<RideId>("economy");
  const selectedRide = useMemo(
    () => rides.find(ride => ride.id === selected)!,
    [selected]
  );

  return (
    <main className="ride-proposal-page">
      <RoutePreview />
      <section className="ride-selector-panel">
        <div className="ride-selector-heading">
          <p>
            <span /> ELIJE TU VIAJE
          </p>
          <h1>¿Cómo quieres viajar hoy?</h1>
          <span>Selecciona una opción. Verás el total antes de confirmar.</span>
        </div>

        <div
          className="ride-options"
          role="radiogroup"
          aria-label="Tipos de ride"
        >
          {rides.map(ride => {
            const Icon = ride.icon;
            const active = selected === ride.id;
            return (
              <button
                key={ride.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`ride-option ${active ? "is-selected" : ""}`}
                onClick={() => setSelected(ride.id)}
              >
                <span className="ride-option-icon">
                  <Icon size={26} />
                </span>
                <span className="ride-option-copy">
                  <small>{ride.tag}</small>
                  <b>{ride.name}</b>
                  <em>{ride.subtitle}</em>
                  <i>
                    <UsersRound size={14} />
                    {ride.capacity}
                  </i>
                </span>
                <span className="ride-option-meta">
                  <b>{ride.price}</b>
                  <small>
                    <Clock3 size={13} />
                    {ride.eta}
                  </small>
                </span>
                <span className="ride-option-radio">
                  {active && <Check size={14} />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ride-selector-info">
          <ShieldCheck size={19} />
          <span>Conductores verificados y seguimiento de viaje incluido.</span>
          <button
            type="button"
            onClick={() =>
              toast.info("Los precios se muestran antes de confirmar")
            }
          >
            Cómo funciona
          </button>
        </div>
        <div className="ride-confirm-bar">
          <span>
            <small>Tu selección</small>
            <b>
              {selectedRide.name} <em>· {selectedRide.eta}</em>
            </b>
          </span>
          <button
            type="button"
            onClick={() =>
              toast.success(
                `Listo: ${selectedRide.name} seleccionado para tu viaje`
              )
            }
          >
            Continuar <b>{selectedRide.price}</b>
          </button>
        </div>
        <div className="ride-payment-note">
          <CreditCard size={15} /> Pago directo: método confirmado con el conductor{" "}
          <BriefcaseBusiness size={15} /> Viaje de trabajo
        </div>
      </section>
    </main>
  );
}
