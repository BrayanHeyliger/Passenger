import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CarFront,
  Check,
  CircleCheck,
  ChevronLeft,
  Clock3,
  MapPin,
  Navigation,
  LocateFixed,
  Loader2,
  ShieldCheck,
  Star,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import NominatimAutocomplete from "@/components/NominatimAutocomplete";
import "./ride-overlay-demo.css";

type RideId = "standard" | "comfort" | "xl";
type Stage = "ready" | "choose" | "summary";
type Coordinates = { lat: number; lng: number };
type RouteEstimate = { distanceKm: number; minutes: number };

function approximateDistanceKm(origin: Coordinates, destination: Coordinates) {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const radiusKm = 6_371;
  const latitudeDifference = toRadians(destination.lat - origin.lat);
  const longitudeDifference = toRadians(destination.lng - origin.lng);
  const latitudeOrigin = toRadians(origin.lat);
  const latitudeDestination = toRadians(destination.lat);
  const arc = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(latitudeOrigin) * Math.cos(latitudeDestination) * Math.sin(longitudeDifference / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

const rides = [
  {
    id: "standard" as RideId,
    label: "UnPasajero",
    detail: "El viaje que necesitas, sin complicaciones",
    baseFare: 3.5,
    perMile: 1.45,
    capacity: "Hasta 4 pasajeros",
    Icon: CarFront,
  },
  {
    id: "comfort" as RideId,
    label: "Comfort",
    detail: "Más espacio y una llegada más tranquila",
    baseFare: 4.75,
    perMile: 1.95,
    capacity: "Hasta 4 pasajeros",
    Icon: Star,
  },
  {
    id: "xl" as RideId,
    label: "UnPasajero XL",
    detail: "Para grupos, maletas y más espacio",
    baseFare: 6.25,
    perMile: 2.65,
    capacity: "Hasta 6 pasajeros",
    Icon: UsersRound,
  },
];

function MapScene() {
  const curves = Array.from(
    { length: 12 },
    (_, index) =>
      `M${-40 + index * 93} 0 C ${40 + index * 75} 100 ${-80 + index * 107} 350 ${20 + index * 82} 760`
  );
  const horizontals = Array.from(
    { length: 11 },
    (_, index) =>
      `M0 ${35 + index * 68} C 210 ${-3 + index * 69} 450 ${105 + index * 61} 980 ${37 + index * 66}`
  );
  return (
    <div className="ride-overlay-map" aria-hidden="true">
      <svg viewBox="0 0 980 760" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="mapShine" cx="70%" cy="38%">
            <stop stopColor="#1a4d48" stopOpacity=".44" />
            <stop offset=".65" stopColor="#0c1c23" stopOpacity=".08" />
            <stop offset="1" stopColor="#050d12" />
          </radialGradient>
        </defs>
        <rect width="980" height="760" fill="url(#mapShine)" />
        {curves.map((d, index) => (
          <path
            d={d}
            key={`curve-${index}`}
            stroke={index % 3 === 0 ? "#27414b" : "#17313b"}
            strokeWidth={index % 3 === 0 ? 4 : 2}
            fill="none"
          />
        ))}
        {horizontals.map((d, index) => (
          <path
            d={d}
            key={`road-${index}`}
            stroke={index % 4 === 0 ? "#29434d" : "#19323c"}
            strokeWidth={index % 4 === 0 ? 4 : 2}
            fill="none"
          />
        ))}
        <path
          d="M180 565 C 316 583 376 500 470 454 S 569 425 641 328 S 728 255 819 176"
          stroke="#123c2f"
          strokeWidth="25"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M180 565 C 316 583 376 500 470 454 S 569 425 641 328 S 728 255 819 176"
          stroke="#55e49b"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          filter="url(#routeGlow)"
        />
        <circle
          cx="180"
          cy="565"
          r="24"
          fill="#0d2a26"
          stroke="#55e49b"
          strokeWidth="6"
        />
        <circle cx="180" cy="565" r="8" fill="#fff" />
        <circle
          cx="819"
          cy="176"
          r="24"
          fill="#2c1718"
          stroke="#ff8178"
          strokeWidth="6"
        />
        <circle cx="819" cy="176" r="8" fill="#fff" />
        <g transform="translate(550 393) rotate(-24)">
          <rect x="-25" y="-12" width="50" height="24" rx="9" fill="#e8f0ee" />
          <path d="M-14 -12h28l7 8H-21z" fill="#fff" />
          <circle cx="-14" cy="13" r="5" fill="#0d171a" />
          <circle cx="14" cy="13" r="5" fill="#0d171a" />
        </g>
      </svg>
      <b className="ride-overlay-label ride-overlay-label--one">DOWNTOWN</b>
      <b className="ride-overlay-label ride-overlay-label--two">LAKE EOLA</b>
      <b className="ride-overlay-label ride-overlay-label--three">MILLS 50</b>
    </div>
  );
}

export default function RideOverlayDemoPage({
  integrated = false,
}: {
  integrated?: boolean;
}) {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<Stage>("ready");
  const [selected, setSelected] = useState<RideId>("standard");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationActionState, setLocationActionState] = useState<"ready" | "success" | "hidden">("ready");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeEstimate, setRouteEstimate] = useState<RouteEstimate | null>(null);
  const [locationHint, setLocationHint] = useState("Sugerencias cerca de ti");
  const ride = rides.find(item => item.id === selected)!;
  const nearbyViewbox = useMemo<[number, number, number, number]>(
    () => [
      (pickupCoords?.lng ?? -81.3792) - 0.23,
      (pickupCoords?.lat ?? 28.5383) - 0.18,
      (pickupCoords?.lng ?? -81.3792) + 0.23,
      (pickupCoords?.lat ?? 28.5383) + 0.18,
    ],
    [pickupCoords]
  );
  const routeSummary = routeEstimate
    ? `${routeEstimate.distanceKm.toFixed(1)} km · ${routeEstimate.minutes} min`
    : "Selecciona origen y destino";
  const quoteFor = (item: (typeof rides)[number]) => {
    if (!routeEstimate) return "—";
    const miles = routeEstimate.distanceKm * 0.621371;
    return `$${(item.baseFare + miles * item.perMile).toFixed(2)}`;
  };
  const etaFor = () => routeEstimate ? `${routeEstimate.minutes} min` : "Calculando";

  useEffect(() => {
    if (!pickupCoords || !destinationCoords) {
      setRouteEstimate(null);
      return;
    }
    let cancelled = false;
    const calculateRoute = async () => {
      setRouteLoading(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=false`;
        const response = await fetch(url);
        const data = await response.json();
        const route = data.routes?.[0];
        if (!route || cancelled) return;
        const distanceKm = Math.max(0.1, Number(route.distance) / 1000);
        const minutes = Math.max(2, Math.ceil(Number(route.duration) / 60));
        setRouteEstimate({ distanceKm, minutes });
        setLocationHint(`Ruta lista · ${distanceKm.toFixed(1)} km · ${minutes} min`);
      } catch {
        if (!cancelled) {
          const distanceKm = Math.max(0.1, approximateDistanceKm(pickupCoords, destinationCoords));
          const minutes = Math.max(2, Math.ceil((distanceKm / 28) * 60));
          setRouteEstimate({ distanceKm, minutes });
          setLocationHint(`Ruta aproximada · ${distanceKm.toFixed(1)} km · ${minutes} min`);
        }
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    };
    void calculateRoute();
    return () => { cancelled = true; };
  }, [pickupCoords, destinationCoords]);
  useEffect(() => {
    if (locationActionState !== "success") return;
    const timer = window.setTimeout(() => setLocationActionState("hidden"), 1_500);
    return () => window.clearTimeout(timer);
  }, [locationActionState]);
  const close = () => setStage("ready");
  const handleUseExactLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no permite obtener ubicación");
      return;
    }
    setLocating(true);
    setLocationActionState("ready");
    setLocationHint("Buscando tu ubicación exacta…");
    navigator.geolocation.getCurrentPosition(
      async position => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPickupCoords(coords);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
            { headers: { "Accept-Language": "es,en;q=0.9" } }
          );
          const data = await response.json();
          const label = typeof data.display_name === "string"
            ? data.display_name.split(",").slice(0, 3).join(",").trim()
            : "Mi ubicación actual";
          setPickup(label);
        } catch {
          setPickup("Mi ubicación actual");
        } finally {
          setLocationHint("Ubicación lista · ahora elige tu destino");
          setLocationActionState("success");
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationHint("Escribe una dirección o activa ubicación para sugerencias cercanas");
        toast.error("No pudimos obtener tu ubicación. Revisa el permiso del navegador.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  };
  const openRideSelector = () => {
    if (!pickupCoords || !destinationCoords || !pickup.trim() || !destination.trim()) {
      toast.error("Ingresa y selecciona el origen y el destino para cotizar tu ride.");
      return;
    }
    if (routeLoading) {
      toast.message("Estamos calculando la ruta. Intenta en un momento.");
      return;
    }
    setStage("choose");
  };
  const confirmRequest = () => {
    if (!pickupCoords || !destinationCoords || !routeEstimate) {
      toast.error("Falta calcular la ruta antes de confirmar.");
      return;
    }
    const requestId = `trip-${Date.now()}`;
    const trip = {
      id: requestId,
      pickup,
      destination,
      pickupCoords,
      destinationCoords,
      vehicle: ride.id,
      serviceLabel: ride.label,
      estimatedPrice: Number(quoteFor(ride).replace(/[^0-9.]/g, "")),
      estimatedEta: etaFor(),
      estimatedDistanceKm: routeEstimate.distanceKm,
      status: "searching",
      createdAt: Date.now(),
    };
    localStorage.setItem("unpasajeroActiveTrip", JSON.stringify(trip));
    sessionStorage.setItem("pendingTrip", JSON.stringify(trip));
    if (integrated) {
      navigate(`/trip-request?tripId=${requestId}`);
      return;
    }
    toast.success("Solicitud preparada. La página no cambió de posición.");
  };
  return (
    <main
      className={`ride-overlay-page${integrated ? " ride-overlay-page--integrated" : ""}`}
    >
      <MapScene />
      {!integrated && (
        <header className="ride-overlay-nav">
          <a href="/" className="ride-overlay-brand">
            <i>P</i>
            <span>
              <b>UnPasajero.Com</b>
              <small>MOVILIDAD EN UN SOLO LUGAR</small>
            </span>
          </a>
          <nav>
            <a href="#clientes">Clientes</a>
            <a href="#conductores">Conductores</a>
            <a href="#flotillas">Flotillas</a>
            <a href="#precios">Precios</a>
          </nav>
          <button>Mi cuenta</button>
        </header>
      )}
      <section className="ride-overlay-intro">
        <p>
          <i /> CONDUCTORES DISPONIBLES AHORA
        </p>
        <h1>
          Tu próximo viaje
          <br />
          empieza <em>aquí.</em>
        </h1>
        <span>
          Una forma más simple de elegir, confirmar y seguir cada recorrido.
        </span>
        <div>
          <b>
            <ShieldCheck size={18} /> Conductores verificados
          </b>
          <b>
            <Clock3 size={18} /> Respuesta rápida
          </b>
        </div>
      </section>
      <section className="ride-overlay-launcher" aria-label="Solicitud rápida">
        <div className="ride-overlay-request-group">
          {locationActionState !== "hidden" ? (
            <button
              type="button"
              className={`ride-overlay-location-priority${locationActionState === "success" ? " is-success" : ""}`}
              onClick={locationActionState === "success" ? undefined : handleUseExactLocation}
              disabled={locating || locationActionState === "success"}
              title="Usar mi ubicación exacta"
            >
              <span className="ride-overlay-location-icon">
                {locating ? <Loader2 size={20} className="animate-spin" /> : locationActionState === "success" ? <CircleCheck size={21} /> : <LocateFixed size={20} />}
              </span>
              <span>
                <small>{locationActionState === "success" ? "LISTO" : "RECOMENDADO"}</small>
                <b>{locating ? "Buscando tu ubicación…" : locationActionState === "success" ? "Ubicación lista" : "Usar mi ubicación exacta"}</b>
                <em>{locationActionState === "success" ? "Continuamos con tu destino" : "Te recogemos donde estás ahora"}</em>
              </span>
              {locationActionState === "success" ? <CircleCheck size={18} /> : <ArrowRight size={18} />}
            </button>
          ) : (
            <button
              type="button"
              className="ride-overlay-location-compact"
              onClick={() => setLocationActionState("ready")}
            >
              <CircleCheck size={15} />
              <span>Ubicación lista</span>
              <em>Cambiar</em>
            </button>
          )}
          <div className="ride-overlay-manual-caption"><span /> O escribe una dirección manualmente <span /></div>
          <div className="ride-overlay-locations">
            <span>
              <small>RECÓGEME EN</small>
              <NominatimAutocomplete
                className="ride-overlay-autocomplete"
                placeholder="Ingresa tu ubicación exacta"
                value={pickup}
                onChange={value => {
                  setPickup(value);
                  setPickupCoords(null);
                  setLocationHint("Escribe y elige una sugerencia cercana");
                }}
                onSelect={(address, lat, lng) => {
                  setPickup(address);
                  setPickupCoords({ lat, lng });
                }}
                icon={<MapPin size={17} />}
                countryCode="us"
                viewbox={nearbyViewbox}
              />
            </span>
            <span>
              <small>VOY A</small>
              <NominatimAutocomplete
                className="ride-overlay-autocomplete ride-overlay-autocomplete--destination"
                placeholder="¿A dónde vas?"
                value={destination}
                onChange={value => {
                  setDestination(value);
                  setDestinationCoords(null);
                  setLocationHint("Elige tu destino para calcular ruta y precio");
                }}
                onSelect={(address, lat, lng) => {
                  setDestination(address);
                  setDestinationCoords({ lat, lng });
                }}
                icon={<Navigation size={17} />}
                countryCode="us"
                viewbox={nearbyViewbox}
              />
            </span>
          </div>
        </div>
        <button
          className="ride-overlay-open"
          onClick={openRideSelector}
          disabled={routeLoading}
        >
          {routeLoading ? "Calculando" : "Elegir mi ride"} <ArrowRight size={18} />
        </button>
        <small className="ride-overlay-location-hint">
          {routeLoading ? "Calculando la ruta…" : locationHint}
          {routeEstimate ? ` · ${routeSummary}` : ""}
        </small>
      </section>
      {stage !== "ready" && (
        <div className="ride-overlay-backdrop" onClick={close}>
          <section
            className="ride-overlay-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Seleccionar ride"
            onClick={event => event.stopPropagation()}
          >
            <button
              className="ride-overlay-close"
              onClick={close}
              aria-label="Cerrar selector"
            >
              <X size={19} />
            </button>
            {stage === "choose" ? (
              <>
                <div className="ride-overlay-sheet-heading">
                  <p>ELIGE TU RIDE</p>
                  <h2>¿Cómo quieres viajar?</h2>
                  <span>
                    {routeSummary}. Elige y continúa cuando estés listo.
                  </span>
                </div>
                <div className="ride-overlay-options" role="radiogroup">
                  {rides.map(item => {
                    const active = item.id === selected;
                    const Icon = item.Icon;
                    return (
                      <button
                        key={item.id}
                        role="radio"
                        aria-checked={active}
                        className={active ? "is-selected" : ""}
                        onClick={() => setSelected(item.id)}
                      >
                        <span className="ride-overlay-icon">
                          <Icon size={22} />
                        </span>
                        <span className="ride-overlay-option-copy">
                          <b>{item.label}</b>
                          <small>{item.detail}</small>
                          <em>{item.capacity}</em>
                        </span>
                        <span className="ride-overlay-option-price">
                          <b>{quoteFor(item)}</b>
                          <small>
                            <Clock3 size={12} />
                            {etaFor()}
                          </small>
                        </span>
                        <span className="ride-overlay-radio">
                          {active && <Check size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  className="ride-overlay-continue"
                  onClick={() => setStage("summary")}
                >
                  <span>
                    Continuar con {ride.label}
                    <small>{routeSummary}</small>
                  </span>
                  <b>
                    {quoteFor(ride)}
                    <ArrowRight size={18} />
                  </b>
                </button>
              </>
            ) : (
              <>
                <button
                  className="ride-overlay-back"
                  onClick={() => setStage("choose")}
                >
                  <ChevronLeft size={16} /> Cambiar ride
                </button>
                <div className="ride-overlay-sheet-heading ride-overlay-summary-heading">
                  <p>LISTO PARA CONFIRMAR</p>
                  <h2>Tu viaje está preparado</h2>
                </div>
                <div className="ride-overlay-summary">
                  <span className="ride-overlay-icon">
                    <ride.Icon size={23} />
                  </span>
                  <span>
                    <small>RIDE SELECCIONADO</small>
                    <b>{ride.label}</b>
                    <em>
                      {ride.capacity} · Llegada {etaFor()}
                    </em>
                  </span>
                  <strong>{quoteFor(ride)}</strong>
                </div>
                <div className="ride-overlay-route-summary">
                  <span>
                    <MapPin size={16} /> {pickup}
                  </span>
                  <span>
                    <Navigation size={16} /> {destination}
                  </span>
                </div>
                <button
                  className="ride-overlay-continue"
                  onClick={confirmRequest}
                >
                  <span>
                    Confirmar solicitud
                    <small>Seguimiento y pago seguro incluidos</small>
                  </span>
                  <b>
                    <ArrowRight size={19} />
                  </b>
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
