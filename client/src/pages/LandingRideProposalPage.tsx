import { useState } from "react";
import {
  ArrowRight,
  CarFront,
  Check,
  CircleDot,
  Clock3,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import "./landing-ride-proposal.css";

type Option = "standard" | "comfort" | "xl";

const options = [
  {
    id: "standard" as Option,
    name: "UnPasajero",
    detail: "La opción práctica para hoy",
    eta: "4 min",
    price: "$115",
    icon: CarFront,
  },
  {
    id: "comfort" as Option,
    name: "Comfort",
    detail: "Más espacio y tranquilidad",
    eta: "6 min",
    price: "$148",
    icon: Sparkles,
  },
  {
    id: "xl" as Option,
    name: "UnPasajero XL",
    detail: "Para grupos y equipaje",
    eta: "8 min",
    price: "$189",
    icon: UsersRound,
  },
];

function HeroMap() {
  return (
    <div className="landing-ride-map" aria-hidden="true">
      <svg viewBox="0 0 860 740">
        <defs>
          <filter id="landingGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="860" height="740" fill="#08171d" />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={`a-${i}`}
            d={`M0 ${45 + i * 67} C150 ${-5 + i * 67} 280 ${100 + i * 57} 470 ${42 + i * 65} S700 ${11 + i * 70} 860 ${53 + i * 61}`}
            fill="none"
            stroke={i % 2 ? "#132b35" : "#1c3640"}
            strokeWidth={i % 2 ? 2 : 4}
          />
        ))}
        {[76, 190, 306, 422, 552, 680, 794].map((x, i) => (
          <path
            key={`b-${x}`}
            d={`M${x} 0 C ${x - 53} 170 ${x + 58} 430 ${x - 20} 740`}
            fill="none"
            stroke={i % 2 ? "#142d36" : "#203b45"}
            strokeWidth="2.5"
          />
        ))}
        <path
          d="M118 520 C242 548 306 456 391 395 S502 356 570 282 S645 238 739 169"
          fill="none"
          stroke="#143d2d"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M118 520 C242 548 306 456 391 395 S502 356 570 282 S645 238 739 169"
          fill="none"
          stroke="#53e49a"
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#landingGlow)"
        />
        <circle
          cx="118"
          cy="520"
          r="24"
          fill="#09231f"
          stroke="#55e69c"
          strokeWidth="6"
        />
        <circle cx="118" cy="520" r="8" fill="#effff7" />
        <circle
          cx="739"
          cy="169"
          r="24"
          fill="#291515"
          stroke="#ff827a"
          strokeWidth="6"
        />
        <circle cx="739" cy="169" r="8" fill="#fff6f4" />
      </svg>
      <span className="landing-map-name landing-map-name--one">DOWNTOWN</span>
      <span className="landing-map-name landing-map-name--two">LAKE EOLA</span>
      <span className="landing-map-name landing-map-name--three">MILLS 50</span>
    </div>
  );
}

export default function LandingRideProposalPage() {
  const [selected, setSelected] = useState<Option>("standard");
  const ride = options.find(item => item.id === selected)!;
  return (
    <main className="landing-ride-page">
      <header className="landing-ride-nav">
        <a href="/" className="landing-ride-brand">
          <span>P</span>
          <b>
            UnPasajero.Com<small>MOVILIDAD EN UN SOLO LUGAR</small>
          </b>
        </a>
        <nav>
          <a href="#clientes">Clientes</a>
          <a href="#conductores">Conductores</a>
          <a href="#flotillas">Flotillas</a>
          <a href="#precios">Precios</a>
        </nav>
        <button
          onClick={() =>
            toast.info("Tu cuenta estará disponible tras iniciar sesión")
          }
        >
          Mi cuenta
        </button>
      </header>
      <section className="landing-ride-hero">
        <HeroMap />
        <div className="landing-ride-copy">
          <p>
            <i /> MOVILIDAD SIN COMPLICACIONES
          </p>
          <h1>
            Tu próximo viaje empieza <em>aquí.</em>
          </h1>
          <span>
            Elige cómo quieres moverte y conoce el precio antes de confirmar.
            Sin sorpresas, con seguimiento incluido.
          </span>
          <div className="landing-trust">
            <span>
              <ShieldCheck size={20} />
              <b>
                Conductores verificados<small>Tu seguridad primero</small>
              </b>
            </span>
            <span>
              <Clock3 size={20} />
              <b>
                Respuesta rápida<small>Opciones en minutos</small>
              </b>
            </span>
          </div>
        </div>
        <section className="landing-ride-selector" aria-label="Solicitar ride">
          <div className="landing-selector-heading">
            <p>
              <MapPin size={16} /> SOLICITA UN RIDE
            </p>
            <h2>¿A dónde vamos?</h2>
          </div>
          <div className="landing-address">
            <span>
              <i className="landing-origin">
                <CircleDot size={18} />
              </i>
              <small>RECÓGEME EN</small>
              <b>Lake Eola Park, Orlando, FL</b>
            </span>
            <span>
              <i className="landing-destination">
                <Navigation size={18} />
              </i>
              <small>VOY A</small>
              <b>Orlando International Airport (MCO)</b>
            </span>
          </div>
          <div className="landing-service-title">
            <b>Elige tu ride</b>
            <span>Precio antes de confirmar</span>
          </div>
          <div
            className="landing-service-options"
            role="radiogroup"
            aria-label="Selecciona un ride"
          >
            {options.map(option => {
              const Icon = option.icon;
              const active = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(option.id)}
                  className={active ? "is-selected" : ""}
                >
                  <span className="landing-service-icon">
                    <Icon size={21} />
                  </span>
                  <span className="landing-service-copy">
                    <b>{option.name}</b>
                    <small>{option.detail}</small>
                  </span>
                  <span className="landing-service-meta">
                    <b>{option.price}</b>
                    <small>
                      <Clock3 size={12} />
                      {option.eta}
                    </small>
                  </span>
                  <span className="landing-service-check">
                    {active && <Check size={13} />}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            className="landing-confirm"
            onClick={() =>
              toast.success(
                `${ride.name} seleccionado. Buscaremos un conductor disponible.`
              )
            }
          >
            <span>
              Continuar con {ride.name}
              <small>Recogida estimada: {ride.eta}</small>
            </span>
            <b>
              {ride.price}
              <ArrowRight size={17} />
            </b>
          </button>
          <p className="landing-selector-foot">
            <ShieldCheck size={15} /> Seguimiento de viaje y pago directo al
            conductor.
          </p>
        </section>
      </section>
      <section className="landing-ride-benefits">
        <span>
          <CarFront size={23} />
          <b>
            Viajes cómodos<small>Opciones para cada momento</small>
          </b>
        </span>
        <span>
          <ShieldCheck size={23} />
          <b>
            Todo bajo control<small>Ruta y conductor en tiempo real</small>
          </b>
        </span>
        <span>
          <UsersRound size={23} />
          <b>
            También para equipos<small>Flotillas y viajes corporativos</small>
          </b>
        </span>
      </section>
    </main>
  );
}
