import { useEffect, useMemo, useState } from "react";
import {
  Car,
  CircleHelp,
  Clock3,
  LocateFixed,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  Signal,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { type DriverLocation, useSocket } from "@/hooks/useSocket";
import "./trip-flow-responsive.css";

type TripStep = "solicitud" | "aceptado" | "camino" | "llegada";

const routePath =
  "M 120 410 C 196 449 274 446 352 421 C 438 393 490 400 567 358 C 646 316 704 333 773 281 C 826 241 874 242 915 207";

const roads = [
  "M35 102 L280 22 L512 118 L872 62 L1000 129",
  "M10 210 L218 152 L406 242 L645 154 L974 240",
  "M0 332 L184 288 L390 360 L602 270 L820 351 L1000 313",
  "M20 506 L238 436 L460 514 L690 432 L973 504",
  "M72 628 L310 530 L557 622 L788 544 L998 632",
  "M84 0 L141 650",
  "M228 0 L296 650",
  "M395 0 L372 650",
  "M534 0 L595 650",
  "M690 0 L657 650",
  "M849 0 L773 650",
  "M958 0 L887 650",
  "M0 86 C180 146 230 169 367 118 C496 68 617 112 788 98 C889 88 931 134 1000 163",
  "M0 472 C172 417 302 469 434 420 C577 366 687 444 819 397 C900 369 937 401 1000 420",
  "M130 0 C162 122 232 198 188 304 C155 386 223 475 279 650",
  "M492 0 C470 120 532 195 488 277 C436 377 499 502 540 650",
  "M747 0 C673 115 746 207 699 301 C655 385 738 470 762 650",
];

function ControlledStreetMap({
  onPickup,
  onDestination,
  driverLocation,
}: {
  onPickup: () => void;
  onDestination: () => void;
  driverLocation: DriverLocation | null;
}) {
  const gpsVehicle = driverLocation
    ? {
        x: Math.max(
          120,
          Math.min(915, 120 + ((driverLocation.lng + 99.1677) / 0.0958) * 795)
        ),
        y: Math.max(
          207,
          Math.min(410, 410 - ((driverLocation.lat - 19.427) / 0.0093) * 203)
        ),
        heading: driverLocation.heading ?? 0,
      }
    : null;
  return (
    <div
      className="functional-map-shell"
      aria-label="Mapa de seguimiento en vivo"
    >
      <svg
        className="functional-map-svg"
        viewBox="0 0 1000 650"
        role="img"
        aria-label="Mapa urbano con ruta activa"
      >
        <defs>
          <filter id="routeGlow" x="-40%" y="-70%" width="180%" height="240%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="pickupGlow">
            <stop stopColor="#57eba1" stopOpacity=".75" />
            <stop offset="1" stopColor="#57eba1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="destinationGlow">
            <stop stopColor="#ff7c75" stopOpacity=".72" />
            <stop offset="1" stopColor="#ff7c75" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="carMetal" x1="0" x2="1">
            <stop stopColor="#f5f7f7" />
            <stop offset=".45" stopColor="#7f898c" />
            <stop offset="1" stopColor="#f5f7f7" />
          </linearGradient>
        </defs>
        <rect width="1000" height="650" fill="#07121a" />
        <g opacity=".9">
          {roads.map((d, index) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={index < 5 ? "#20343e" : "#162832"}
              strokeWidth={index < 5 ? 5 : 2.4}
              strokeLinecap="round"
            />
          ))}
          {[40, 98, 154, 206, 258, 315, 369, 425, 481, 539, 600].map(y => (
            <path
              key={y}
              d={`M0 ${y} C 210 ${y - 44} 327 ${y + 48} 548 ${y - 13} S 838 ${y + 37} 1000 ${y - 14}`}
              fill="none"
              stroke="#152630"
              strokeWidth="1.7"
              opacity=".86"
            />
          ))}
        </g>

        <path
          d={routePath}
          fill="none"
          stroke="#09241a"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d={routePath}
          fill="none"
          stroke="#45e693"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#routeGlow)"
        />
        <path
          d={routePath}
          fill="none"
          stroke="#b7ffd7"
          strokeOpacity=".45"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <g
          onClick={onPickup}
          className="functional-map-marker functional-map-marker--pickup"
          role="button"
          tabIndex={0}
          aria-label="Punto de recogida"
        >
          <circle cx="120" cy="410" r="54" fill="url(#pickupGlow)" />
          <circle
            cx="120"
            cy="410"
            r="27"
            fill="#47e496"
            fillOpacity=".18"
            stroke="#47e496"
            strokeWidth="2"
          />
          <circle
            cx="120"
            cy="410"
            r="15"
            fill="#f5fff9"
            stroke="#47e496"
            strokeWidth="6"
          />
          <circle cx="120" cy="410" r="4" fill="#0a1814" />
        </g>
        <g
          onClick={onDestination}
          className="functional-map-marker functional-map-marker--destination"
          role="button"
          tabIndex={0}
          aria-label="Destino"
        >
          <circle cx="915" cy="207" r="50" fill="url(#destinationGlow)" />
          <circle
            cx="915"
            cy="207"
            r="23"
            fill="#0b151a"
            stroke="#ff7c75"
            strokeWidth="7"
          />
          <circle cx="915" cy="207" r="10" fill="#f5f8f8" />
          <circle cx="915" cy="207" r="4" fill="#111b20" />
        </g>

        <g
          className="functional-map-car"
          aria-label="Vehículo en movimiento"
          transform={
            gpsVehicle
              ? `translate(${gpsVehicle.x} ${gpsVehicle.y}) rotate(${gpsVehicle.heading})`
              : undefined
          }
        >
          {!gpsVehicle && (
            <animateMotion
              dur="12s"
              repeatCount="indefinite"
              rotate="auto"
              path={routePath}
            />
          )}
          <ellipse cx="0" cy="11" rx="34" ry="8" fill="#000" opacity=".5" />
          <path
            d="M-33 2 L-22 -13 L18 -13 L33 2 L31 12 L-31 12 Z"
            fill="url(#carMetal)"
            stroke="#e9f0f1"
            strokeWidth="2"
          />
          <path
            d="M-17 -13 L-9 -24 L14 -24 L24 -13 Z"
            fill="#2b3a41"
            stroke="#d9e3e5"
            strokeWidth="1.4"
          />
          <circle
            cx="-20"
            cy="13"
            r="6"
            fill="#111a1d"
            stroke="#e3ecee"
            strokeWidth="2"
          />
          <circle
            cx="21"
            cy="13"
            r="6"
            fill="#111a1d"
            stroke="#e3ecee"
            strokeWidth="2"
          />
        </g>
      </svg>

      <span className="functional-map-area functional-map-area--juarez">
        JUÁREZ
      </span>
      <span className="functional-map-area functional-map-area--roma">
        ROMA NORTE
      </span>
      <span className="functional-map-area functional-map-area--doctores">
        DOCTORES
      </span>
      <span className="functional-map-area functional-map-area--cuauhtemoc">
        CUAUHTÉMOC
      </span>
      <span className="functional-map-area functional-map-area--alamos">
        ÁLAMOS
      </span>

      <div className="functional-map-card functional-map-card--eta">
        <span>Llegada en</span>
        <strong>4 min</strong>
        <small>(1.2 km)</small>
      </div>
      <div className="functional-map-card functional-map-card--pickup">
        <b>Punto de recogida</b>
        <span>
          Av. Reforma 222,
          <br />
          Juárez, Cuauhtémoc, CDMX
        </span>
      </div>
      <div className="functional-map-card functional-map-card--destination">
        <b>Destino</b>
        <span>
          Aeropuerto Internacional
          <br />
          de la Ciudad de México
          <br />
          (AICM)
        </span>
      </div>
      <button
        type="button"
        className="functional-map-locate"
        aria-label="Centrar ubicación"
        onClick={() => toast.info("Mapa centrado en el vehículo")}
      >
        {" "}
        <LocateFixed size={19} />{" "}
      </button>
    </div>
  );
}

export default function FunctionalReferenceTripTrackingPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<TripStep>("camino");
  const [live, setLive] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const { driverLocation, isConnected: gpsConnected } = useSocket({
    roomId: "trip-gps-demo",
    userId: "client-controlled-map",
    role: "client",
  });

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(
      () => setElapsed(value => value + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [live]);

  const status = useMemo(
    () =>
      `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`,
    [elapsed]
  );
  const steps: Array<{ key: TripStep; label: string; detail: string }> = [
    { key: "solicitud", label: "Solicitud", detail: "Completado" },
    { key: "aceptado", label: "Aceptado", detail: "Completado" },
    {
      key: "camino",
      label: "En camino",
      detail: step === "camino" ? "En progreso" : "Completado",
    },
    {
      key: "llegada",
      label: "Llegada",
      detail: step === "llegada" ? "Completado" : "Pendiente",
    },
  ];

  return (
    <main className="functional-reference-page min-h-screen bg-[#071016] text-white">
      <header className="functional-reference-header">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="functional-reference-brand"
          aria-label="Volver al inicio"
        >
          <span className="functional-reference-brand-mark">P</span>
          <span>
            <b>Passenger</b>
            <small>MOBILITY PLATFORM</small>
          </span>
        </button>
        <nav aria-label="Navegación">
          <button>Clientes</button>
          <button>Conductores</button>
          <button>Flotillas</button>
          <button>Precios</button>
          <button>Contacto</button>
          <button>FAQ</button>
        </nav>
        <div className="functional-reference-account">
          <button>🇪🇸 ES⌄</button>
          <button>◯ Mi cuenta⌄</button>
        </div>
      </header>

      <section className="functional-reference-layout">
        <aside className="functional-reference-left">
          <div className="functional-live-badge">
            <i /> VIAJE EN CURSO
          </div>
          <h1>
            Tu viaje está en
            <br />
            <em>buenas manos.</em>
          </h1>
          <p>
            Estamos en camino. Sigue el recorrido en tiempo real y prepárate
            para disfrutar un viaje seguro.
          </p>

          <div className="functional-stepper">
            {steps.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStep(item.key)}
                className={step === item.key ? "is-active" : ""}
              >
                <span>
                  {index < 2 || step === item.key ? (
                    item.key === "camino" ? (
                      <Car size={18} />
                    ) : (
                      "✓"
                    )
                  ) : (
                    ""
                  )}
                </span>
                <b>{item.label}</b>
                <small>{item.detail}</small>
              </button>
            ))}
          </div>

          <div className="functional-mobile-map" aria-hidden="true">
            <ControlledStreetMap
              onPickup={() => toast.info("Recogida: Av. Reforma 222")}
              onDestination={() =>
                toast.info(
                  "Destino: Aeropuerto Internacional de la Ciudad de México"
                )
              }
              driverLocation={driverLocation}
            />
          </div>

          <button
            type="button"
            className="functional-driver-card"
            onClick={() =>
              toast.info("Mateo Rivera · 4.9 · Más de 1,200 viajes")
            }
          >
            <span className="functional-driver-photo">MR</span>
            <span>
              <b>Mateo Rivera</b>
              <small>★ 4.9 &nbsp; Más de 1,200 viajes</small>
              <small>
                Toyota Corolla
                <br />
                ABC-123
              </small>
            </span>
            <Phone size={22} />
          </button>
          <div className="functional-actions">
            <button onClick={() => toast.success("Enlace de viaje compartido")}>
              <Share2 size={19} />
              Compartir viaje
            </button>
            <button
              onClick={() => toast.info("Canal seguro de contacto abierto")}
            >
              <Phone size={19} />
              Contactar conductor
            </button>
            <button onClick={() => toast.success("Centro de ayuda abierto")}>
              <CircleHelp size={20} />
              Ayuda
            </button>
          </div>
        </aside>

        <section className="functional-reference-right">
          <ControlledStreetMap
            onPickup={() => toast.info("Recogida: Av. Reforma 222")}
            onDestination={() =>
              toast.info(
                "Destino: Aeropuerto Internacional de la Ciudad de México"
              )
            }
            driverLocation={driverLocation}
          />
          <div className="functional-route-footer">
            <span>
              <ShieldCheck size={43} />
              <b>
                Conductor en camino
                <small>
                  {gpsConnected && driverLocation
                    ? "Ubicación GPS real recibida."
                    : "Todo va según lo planeado."}
                </small>
              </b>
            </span>
            <i />
            <button type="button" onClick={() => setLive(value => !value)}>
              <Signal size={42} />
              <b>
                {live ? "Seguimiento en vivo" : "Seguimiento pausado"}
                <small>
                  {live
                    ? `${gpsConnected ? "GPS conectado" : "Actualización cada 5 segundos"} · ${status}`
                    : "Pulsa para continuar"}
                </small>
              </b>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
