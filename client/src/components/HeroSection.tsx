/**
 * HeroSection — 100% nativo: Leaflet + OpenStreetMap + Nominatim
 * Sin dependencia de Google Maps
 */
import { useState, useRef, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  ChevronRight,
  ShieldCheck,
  Tag,
  Radio,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CarFront,
  LockKeyhole,
} from "lucide-react";
import { useLocation } from "wouter";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import LeafletMap, { type LeafletMapRef } from "@/components/LeafletMap";
import HeroTrackingBackdrop from "@/components/HeroTrackingBackdrop";
import NominatimAutocomplete from "@/components/NominatimAutocomplete";
import { HeroParcelForm } from "@/components/HeroParcelForm";
import "./HeroSectionCompact.css";
import "./BookingProgress.css";
import "./HeroRideSelector.css";

const VEHICLES = [
  {
    id: "economy",
    label: "Económico",
    emoji: "🚗",
    base: 6,
    perKm: 0.9,
    eta: "3 min",
    seats: 4,
  },
  {
    id: "comfort",
    label: "Confort",
    emoji: "🚙",
    base: 9,
    perKm: 1.3,
    eta: "5 min",
    seats: 4,
  },
  {
    id: "premium",
    label: "Premium",
    emoji: "🚘",
    base: 14,
    perKm: 1.8,
    eta: "7 min",
    seats: 4,
  },
  {
    id: "suv",
    label: "SUV",
    emoji: "🚐",
    base: 18,
    perKm: 2.2,
    eta: "8 min",
    seats: 6,
  },
];

const EXTRAS = [
  { id: "pet", label: "Mascota", icon: "🐾", price: 2 },
  { id: "luggage", label: "Maletas", icon: "🧳", price: 1 },
  { id: "child_seat", label: "Silla de niño", icon: "👶", price: 3 },
  { id: "wheelchair", label: "Silla de ruedas", icon: "♿", price: 0 },
  { id: "music", label: "Música a gusto", icon: "🎵", price: 0 },
];

// Geocodifica una dirección de texto usando Nominatim (fallback cuando el usuario escribe sin seleccionar sugerencia)
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "Accept-Language": "es" }, signal: controller.signal }
    );
    const data = await res.json();
    if (data && data[0])
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
  } finally {
    window.clearTimeout(timeout);
  }
  return null;
}

export default function HeroSection() {
  const [, navigate] = useLocation();
  const { config } = useSiteConfig();
  const { isAuthenticated, register } = useLocalAuth();

  const [pickup, setPickup] = useState(
    "Av. Reforma 222, Juárez, Cuauhtémoc, CDMX"
  );
  const [destination, setDestination] = useState(
    "Aeropuerto Internacional de la Ciudad de México (AICM)"
  );
  const [tripTime, setTripTime] = useState<"now" | "later">("now");
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "estimate" | "register">("form");
  const [estimate, setEstimate] = useState<{
    price: number;
    km: number;
    minutes: number;
  } | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [pickupCoords, setPickupCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destCoords, setDestCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef<LeafletMapRef | null>(null);
  const [userCountryCode, setUserCountryCode] = useState<string | undefined>(
    undefined
  );
  const [destViewbox, setDestViewbox] = useState<
    [number, number, number, number] | undefined
  >(undefined);

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [serviceType, setServiceType] = useState<"trip" | "parcel">("trip");

  const handleMapReady = useCallback((ref: LeafletMapRef) => {
    mapRef.current = ref;
    const showcasePickup = { lat: 19.427, lng: -99.1677 };
    const showcaseDestination = { lat: 19.4363, lng: -99.0719 };
    setPickupCoords(showcasePickup);
    setDestCoords(showcaseDestination);
    ref.setPickup(showcasePickup.lat, showcasePickup.lng, "Av. Reforma 222");
    ref.setDropoff(
      showcaseDestination.lat,
      showcaseDestination.lng,
      "Aeropuerto AICM"
    );
    void ref.getRoute();
    ref.setVehiclePosition(19.4312, -99.1284, "Conductor disponible");
    // Solo intentar geolocalización automática si el usuario ya dio permiso antes
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(result => {
          if (result.state === "granted") {
            navigator.geolocation.getCurrentPosition(async pos => {
              const { latitude: lat, longitude: lng } = pos.coords;
              setPickupCoords({ lat, lng });
              ref.setPickup(lat, lng, "Mi ubicación");
              ref.setDropoff(
                showcaseDestination.lat,
                showcaseDestination.lng,
                "Aeropuerto AICM"
              );
              void ref.getRoute();
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                  { headers: { "Accept-Language": "es" } }
                );
                const data = await res.json();
                if (data.display_name)
                  setPickup(
                    data.display_name.split(",").slice(0, 2).join(",").trim()
                  );
                if (data.address?.country_code)
                  setUserCountryCode(data.address.country_code);
                const radius = 0.45;
                setDestViewbox([
                  lng - radius,
                  lat - radius,
                  lng + radius,
                  lat + radius,
                ]);
              } catch {}
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Tu navegador no soporta geolocalización");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPickupCoords({ lat, lng });
        mapRef.current?.setPickup(lat, lng, "Mi ubicación");
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          setPickup(
            data.display_name?.split(",").slice(0, 2).join(",").trim() ||
              "Mi ubicación actual 📍"
          );
          if (data.address?.country_code)
            setUserCountryCode(data.address.country_code);
          const radius = 0.45;
          setDestViewbox([
            lng - radius,
            lat - radius,
            lng + radius,
            lat + radius,
          ]);
        } catch {
          setPickup("Mi ubicación actual 📍");
        }
        setGpsLoading(false);
      },
      err => {
        setGpsLoading(false);
        if (err.code === 1)
          setGpsError("Permiso denegado. Escribe tu dirección manualmente.");
        else if (err.code === 2)
          setGpsError(
            "No se pudo detectar tu ubicación. Escribe tu dirección."
          );
        else
          setGpsError("Error de ubicación. Escribe tu dirección manualmente.");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleCalculate = async () => {
    if (!pickup.trim() || !destination.trim()) return;
    setCalculating(true);
    setCalcError("");

    // Mostrar una estimación local inmediatamente: el proveedor de mapa nunca bloquea la reserva.
    const v = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[0];
    const extrasTotal = selectedExtras.reduce(
      (sum, id) => sum + (EXTRAS.find(e => e.id === id)?.price || 0),
      0
    );
    const fallbackKm = 5;
    const fallbackMinutes = 12;
    const fallbackPrice = parseFloat(
      (v.base + fallbackKm * v.perKm + extrasTotal).toFixed(2)
    );
    setEstimate({
      price: fallbackPrice,
      km: fallbackKm,
      minutes: fallbackMinutes,
    });
    setStep("estimate");
    setCalculating(false);

    // Enriquecer en segundo plano si el mapa consigue coordenadas y ruta.
    let pCoords = pickupCoords;
    let dCoords = destCoords;
    if (!pCoords) pCoords = await geocodeAddress(pickup);
    if (!dCoords) dCoords = await geocodeAddress(destination);
    if (pCoords) {
      setPickupCoords(pCoords);
      mapRef.current?.setPickup(pCoords.lat, pCoords.lng, pickup);
    }
    if (dCoords) {
      setDestCoords(dCoords);
      mapRef.current?.setDropoff(dCoords.lat, dCoords.lng, destination);
    }
    if (pCoords && dCoords) {
      const route = await mapRef.current?.getRoute();
      if (route) {
        const km = parseFloat(route.distanceKm.toFixed(1));
        const minutes = route.durationMin;
        const price = parseFloat(
          (v.base + km * v.perKm + extrasTotal).toFixed(2)
        );
        setEstimate({ price, km, minutes });
      }
    }
  };

  const handleRequestTrip = () => {
    if (isAuthenticated) {
      sessionStorage.setItem(
        "pendingTrip",
        JSON.stringify({
          pickup,
          destination,
          vehicle: selectedVehicle,
          extras: selectedExtras,
          estimate,
        })
      );
      navigate("/marketplace");
    } else {
      setStep("register");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    const nameParts = regName.trim().split(" ");
    const result = await register({
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(" ") || undefined,
      email: `${regPhone.replace(/\D/g, "")}@taxi.app`,
      phone: regPhone,
      password: regPassword,
      role: "client",
    });
    setRegLoading(false);
    if (!result.success) {
      setRegError(result.error || "Error al registrar");
      return;
    }
    sessionStorage.setItem(
      "pendingTrip",
      JSON.stringify({
        pickup,
        destination,
        vehicle: selectedVehicle,
        extras: selectedExtras,
        estimate,
      })
    );
    navigate("/marketplace");
  };

  const v = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[0];
  const extrasTotal = selectedExtras.reduce(
    (s, id) => s + (EXTRAS.find(e => e.id === id)?.price || 0),
    0
  );
  const bookingProgressIndex =
    step === "form" ? 0 : step === "estimate" ? 1 : 2;
  const previewQuote = (v.base + 5 * v.perKm + extrasTotal).toFixed(2);

  return (
    <section
      className="passenger-redesign-hero passenger-reference-hero relative w-full flex flex-col overflow-x-hidden"
      style={{ background: "#050b0d" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "oklch(0.76 0.18 148)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: "oklch(0.52 0.12 148)" }}
        />
      </div>
      <HeroTrackingBackdrop />

      <div className="container passenger-reference-container relative z-10 py-6 pb-10 lg:py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 lg:items-start">
          {/* Left: Copy */}
          <div className="order-2 lg:order-1 passenger-reference-copy text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{
                background: "oklch(0.76 0.18 148 / 0.15)",
                color: "oklch(0.76 0.18 148)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.76 0.18 148)" }}
              />
              Conductores disponibles ahora
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Tu próximo viaje
              <br />
              <span style={{ color: "oklch(0.76 0.18 148)" }}>
                empieza aquí.
              </span>
            </h1>
            <p className="text-white/60 text-lg mb-6 leading-relaxed max-w-md mx-auto lg:mx-0">
              Elige cómo quieres moverte y conoce el precio antes de confirmar.
              Sin sorpresas, con ruta visible y seguimiento incluido.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 items-center lg:items-start">
              {[
                { icon: ShieldCheck, text: "Conductores verificados" },
                { icon: Tag, text: "Sin cargos ocultos" },
                { icon: Radio, text: "Seguimiento en vivo" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-white/60 text-sm"
                >
                  <Icon size={15} style={{ color: "oklch(0.76 0.18 148)" }} />{" "}
                  {text}
                </div>
              ))}
            </div>
            <div className="passenger-reference-cta-row flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <a
                href="/register"
                className="passenger-reference-primary-cta inline-flex items-center justify-center gap-2"
              >
                <CarFront size={18} /> Empieza a ganar – Suscríbete
              </a>
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="passenger-reference-secondary-cta inline-flex items-center justify-center gap-2"
              >
                <MapPin size={15} className="text-rose-300" /> Buscar conductor
              </button>
            </div>
            <div className="passenger-reference-social-proof flex items-center justify-center lg:justify-start gap-2 text-white/55 text-sm">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>
                Reserva con precio estimado, ruta visible y controles de
                seguridad.
              </span>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="order-1 lg:order-2 w-full max-w-sm mx-auto sm:max-w-md lg:max-w-none passenger-reference-booking-wrap">
            <div className="passenger-booking-card passenger-reference-card passenger-mobile-compact-card landing-hero-booking-card rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl shadow-black/40 overflow-hidden">
              {/* Guided booking progress — approved Passenger mockup */}
              <div
                className="passenger-stepper passenger-mobile-compact-progress flex items-center justify-between mb-5 px-1"
                aria-label="Progreso de reserva"
              >
                {["Ruta", "Conductor", "Pago", "Confirmación"].map(
                  (label, index) => (
                    <div
                      key={label}
                      className={`passenger-step ${index === bookingProgressIndex ? "is-active" : ""} ${index < bookingProgressIndex ? "is-complete" : ""}`}
                      aria-current={
                        index === bookingProgressIndex ? "step" : undefined
                      }
                    >
                      <span className="passenger-step-dot">{index + 1}</span>
                      <span>{label}</span>
                    </div>
                  )
                )}
              </div>

              {/* Toggle Viaje/Paquete */}
              <div className="passenger-service-toggle flex gap-2 mb-4 p-1 rounded-lg passenger-reference-service-toggle passenger-reference-optional-controls">
                <button
                  onClick={() => setServiceType("trip")}
                  className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all ${
                    serviceType === "trip"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🚗 Viaje
                </button>
                <button
                  onClick={() => setServiceType("parcel")}
                  className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all ${
                    serviceType === "parcel"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📦 Paquete
                </button>
              </div>

              {/* STEP: FORM */}
              {step === "form" && serviceType === "trip" && (
                <>
                  <p className="landing-hero-booking-eyebrow">
                    <span /> SOLICITA UN RIDE
                  </p>
                  <h2
                    className="passenger-mobile-compact-title text-lg lg:text-xl font-bold text-slate-900 mb-4"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    ¿A dónde vamos?
                  </h2>

                  {/* Pickup */}
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0">
                        <NominatimAutocomplete
                          placeholder="¿Dónde te recogemos?"
                          value={pickup}
                          onChange={val => {
                            setPickup(val);
                            if (!val) setPickupCoords(null);
                          }}
                          onSelect={(addr, lat, lng) => {
                            setPickupCoords({ lat, lng });
                            setGpsError("");
                            mapRef.current?.setPickup(lat, lng, addr);
                          }}
                          icon={
                            <span
                              className="w-3 h-3 rounded-full inline-block"
                              style={{ background: "oklch(0.76 0.18 148)" }}
                            />
                          }
                        />
                      </div>
                      <button
                        onClick={handleGetMyLocation}
                        disabled={gpsLoading}
                        className="px-3 py-3 rounded-xl border border-slate-200 hover:bg-green-50 transition-colors flex-shrink-0 disabled:opacity-50"
                        title="Usar mi ubicación actual"
                      >
                        {gpsLoading ? (
                          <Loader2
                            size={16}
                            className="text-green-500 animate-spin"
                          />
                        ) : (
                          <Navigation size={16} className="text-green-500" />
                        )}
                      </button>
                    </div>
                    {gpsError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600">
                        <AlertCircle size={12} />
                        <span>{gpsError}</span>
                      </div>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="mb-4">
                    <p className="passenger-reference-field-label">
                      ¿A dónde vas?
                    </p>
                    <NominatimAutocomplete
                      placeholder="¿A dónde vas?"
                      value={destination}
                      onChange={val => {
                        setDestination(val);
                        if (!val) setDestCoords(null);
                      }}
                      onSelect={(addr, lat, lng) => {
                        setDestCoords({ lat, lng });
                        mapRef.current?.setDropoff(lat, lng, addr);
                      }}
                      icon={
                        <span
                          className="w-3 h-3 rounded-full border-2 inline-block"
                          style={{ borderColor: "#EF4444" }}
                        />
                      }
                      countryCode={userCountryCode}
                      viewbox={destViewbox}
                    />
                  </div>

                  <div
                    className="passenger-quick-quote mb-4"
                    aria-live="polite"
                  >
                    <div>
                      <span>Estimación inicial</span>
                      <strong>Desde ${previewQuote}</strong>
                    </div>
                    <p>
                      <Clock size={13} /> ~12 min · Precio final según ruta real
                    </p>
                  </div>

                  <div
                    className="landing-hero-ride-options mb-4"
                    role="radiogroup"
                    aria-label="Elige tu ride"
                  >
                    <div className="landing-hero-ride-options-heading">
                      <b>Elige tu ride</b>
                      <span>Precio antes de confirmar</span>
                    </div>
                    {VEHICLES.filter(vehicle =>
                      ["economy", "comfort", "suv"].includes(vehicle.id)
                    ).map(vehicle => {
                      const selected = selectedVehicle === vehicle.id;
                      const optionName =
                        vehicle.id === "economy"
                          ? "UnPasajero"
                          : vehicle.id === "suv"
                            ? "UnPasajero XL"
                            : "Comfort";
                      const optionDetail =
                        vehicle.id === "economy"
                          ? "La opción práctica para hoy"
                          : vehicle.id === "suv"
                            ? "Para grupos y equipaje"
                            : "Más espacio y tranquilidad";
                      const optionPrice = (
                        vehicle.base +
                        5 * vehicle.perKm +
                        extrasTotal
                      ).toFixed(2);
                      return (
                        <button
                          key={vehicle.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setSelectedVehicle(vehicle.id)}
                          className={selected ? "is-selected" : ""}
                        >
                          <span className="landing-hero-ride-icon">
                            <CarFront size={20} />
                          </span>
                          <span className="landing-hero-ride-copy">
                            <b>{optionName}</b>
                            <small>{optionDetail}</small>
                          </span>
                          <span className="landing-hero-ride-price">
                            <b>${optionPrice}</b>
                            <small>
                              <Clock size={12} /> {vehicle.eta}
                            </small>
                          </span>
                          <span className="landing-hero-ride-check">
                            {selected && <ShieldCheck size={13} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Time selector */}
                  <div className="flex gap-2 mb-4 passenger-reference-optional-controls">
                    {(["now", "later"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTripTime(t)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tripTime === t ? "border-green-500 text-green-700 bg-green-50" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                      >
                        <Clock size={13} />{" "}
                        {t === "now" ? "Ahora" : "Programar"}
                      </button>
                    ))}
                  </div>

                  {/* Extras — compact scrollable row */}
                  <div className="mb-4 passenger-reference-extras passenger-reference-optional-controls">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Requisitos especiales
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {EXTRAS.map(ex => (
                        <button
                          key={ex.id}
                          onClick={() =>
                            setSelectedExtras(prev =>
                              prev.includes(ex.id)
                                ? prev.filter(x => x !== ex.id)
                                : [...prev, ex.id]
                            )
                          }
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedExtras.includes(ex.id) ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                        >
                          {ex.icon} {ex.label}{" "}
                          <span className="text-slate-400">
                            {ex.price > 0 ? `+$${ex.price}` : "+$0"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Map preview — smaller on desktop to avoid overflow */}
                  <div
                    className="passenger-reference-map rounded-2xl overflow-hidden mb-4"
                    style={{ height: "clamp(160px, 34vw, 228px)" }}
                  >
                    <LeafletMap height="100%" onMapReady={handleMapReady} />
                  </div>

                  {calcError && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                      <AlertCircle size={12} />
                      <span>{calcError}</span>
                    </div>
                  )}

                  <div
                    className="passenger-reference-trip-summary"
                    aria-label="Resumen del viaje"
                  >
                    <div>
                      <strong>
                        <CarFront size={16} className="mr-1 inline" /> Economy
                      </strong>
                      <span>Hasta 4 pasajeros</span>
                    </div>
                    <div>
                      <strong>
                        <Clock size={16} className="mr-1 inline" /> 25–30 min
                      </strong>
                      <span>Tiempo estimado</span>
                    </div>
                    <div>
                      <strong>
                        <ShieldCheck size={16} className="mr-1 inline" /> Viaje
                        seguro
                      </strong>
                      <span>Seguimiento en vivo</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCalculate}
                    disabled={
                      !pickup.trim() || !destination.trim() || calculating
                    }
                    className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "oklch(0.76 0.18 148)",
                      color: "oklch(0.08 0.02 148)",
                    }}
                  >
                    {calculating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Calculando ruta...
                      </>
                    ) : (
                      <>
                        Continuar con{" "}
                        {v.id === "economy"
                          ? "UnPasajero"
                          : v.id === "suv"
                            ? "UnPasajero XL"
                            : v.label}{" "}
                        · ${previewQuote} <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                  <p className="passenger-reference-protected text-center text-xs text-slate-400 mt-2">
                    <LockKeyhole size={13} className="mr-1 inline" /> Tus datos
                    están protegidos
                  </p>
                </>
              )}

              {/* STEP: ESTIMATE */}
              {step === "estimate" && estimate && (
                <>
                  <button
                    onClick={() => setStep("form")}
                    className="text-xs text-slate-400 hover:text-slate-600 mb-3 flex items-center gap-1"
                  >
                    ← Cambiar
                  </button>
                  <h2
                    className="text-lg font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Tu viaje estimado
                  </h2>
                  <p className="text-slate-500 text-xs mb-3 truncate">
                    {pickup} → {destination}
                  </p>
                  <div className="flex gap-2 mb-4 text-xs">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                      📍 {estimate.km} km
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                      ⏱ {estimate.minutes} min
                    </span>
                  </div>
                  <div className="landing-estimate-summary mb-4">
                    <div>
                      <span className="landing-estimate-icon">
                        <CarFront size={19} />
                      </span>
                      <span>
                        <small>RIDE SELECCIONADO</small>
                        <b>
                          {v.id === "economy"
                            ? "UnPasajero"
                            : v.id === "suv"
                              ? "UnPasajero XL"
                              : "Comfort"}
                        </b>
                        <em>
                          Hasta {v.seats} pasajeros · Llegada {v.eta}
                        </em>
                      </span>
                      <strong>
                        $
                        {(v.base + estimate.km * v.perKm + extrasTotal).toFixed(
                          2
                        )}
                      </strong>
                    </div>
                    <button type="button" onClick={() => setStep("form")}>
                      Cambiar ride
                    </button>
                  </div>
                  <button
                    onClick={handleRequestTrip}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{
                      background: "oklch(0.76 0.18 148)",
                      color: "oklch(0.08 0.02 148)",
                    }}
                  >
                    Confirmar{" "}
                    {v.id === "economy"
                      ? "UnPasajero"
                      : v.id === "suv"
                        ? "UnPasajero XL"
                        : "Comfort"}{" "}
                    · $
                    {(v.base + estimate.km * v.perKm + extrasTotal).toFixed(2)}{" "}
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* PARCEL FORM */}
              {step === "form" && serviceType === "parcel" && (
                <HeroParcelForm
                  onSubmit={data => {
                    sessionStorage.setItem(
                      "pendingParcel",
                      JSON.stringify(data)
                    );
                  }}
                  onNavigateToDashboard={() => {
                    if (isAuthenticated) {
                      navigate("/client-dashboard?tab=parcels");
                    } else {
                      setStep("register");
                    }
                  }}
                />
              )}

              {/* STEP: REGISTER */}
              {step === "register" && (
                <>
                  <button
                    onClick={() => setStep("estimate")}
                    className="text-xs text-slate-400 hover:text-slate-600 mb-3 flex items-center gap-1"
                  >
                    ← Volver
                  </button>
                  <h2
                    className="text-lg font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Casi listo 🚕
                  </h2>
                  <p className="text-slate-500 text-sm mb-3">
                    Crea tu cuenta para confirmar el viaje
                  </p>
                  {estimate && (
                    <div
                      className="p-3 rounded-xl mb-3 text-sm"
                      style={{
                        background: "oklch(0.76 0.18 148 / 0.1)",
                        border: "1px solid oklch(0.76 0.18 148 / 0.3)",
                      }}
                    >
                      <p className="font-semibold text-slate-800">
                        {v.emoji} {v.label} · $
                        {(v.base + estimate.km * v.perKm + extrasTotal).toFixed(
                          2
                        )}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {pickup} → {destination}
                      </p>
                    </div>
                  )}
                  {regError && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
                      {regError}
                    </div>
                  )}
                  <form onSubmit={handleRegister} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Número de teléfono"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Contraseña (mín. 6 caracteres)"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{
                        background: "oklch(0.76 0.18 148)",
                        color: "oklch(0.08 0.02 148)",
                      }}
                    >
                      {regLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Creando
                          cuenta...
                        </>
                      ) : (
                        <>
                          Confirmar viaje <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-center text-xs text-slate-400 mt-3">
                    ¿Ya tienes cuenta?{" "}
                    <a href="/login" className="text-green-600 hover:underline">
                      Inicia sesión
                    </a>
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs text-white/50">
              Tu información de solicitud se muestra solo durante este flujo y
              bajo tu control.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
