/**
 * HeroSection — Rediseñado con flujo tipo Uber
 * Formulario de viaje inline → estimación de precio → modal de registro rápido → panel de cliente
 */
import { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Clock, ChevronRight, Star, Shield, Zap, X, Eye, EyeOff, Loader2, Car, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useLocalAuth } from "@/contexts/LocalAuthContext";

// Vehicle types with base fares
const VEHICLES = [
  { id: "economy", label: "Económico", emoji: "🚗", base: 6, perKm: 0.9, eta: "3 min", seats: 4 },
  { id: "comfort", label: "Confort", emoji: "🚙", base: 9, perKm: 1.3, eta: "5 min", seats: 4 },
  { id: "premium", label: "Premium", emoji: "🚘", base: 14, perKm: 1.8, eta: "7 min", seats: 4 },
  { id: "suv", label: "SUV", emoji: "🚐", base: 18, perKm: 2.2, eta: "8 min", seats: 6 },
];

export default function HeroSection() {
  const [, navigate] = useLocation();
  const { config } = useSiteConfig();
  const { isAuthenticated, register } = useLocalAuth();

  // Trip form state
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [tripTime, setTripTime] = useState("now");
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [step, setStep] = useState<"form" | "estimate" | "register">("form");
  const [estimate, setEstimate] = useState<{ price: number; km: number; minutes: number } | null>(null);

  // Register modal state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  // Autocomplete suggestions (simulated)
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showPickupSug, setShowPickupSug] = useState(false);
  const [showDestSug, setShowDestSug] = useState(false);

  const popularPlaces = [
    "Aeropuerto Internacional",
    "Centro Comercial Plaza",
    "Hospital Central",
    "Terminal de Buses",
    "Universidad Nacional",
    "Estadio Municipal",
    "Hotel Grand",
    "Parque Central",
  ];

  const handlePickupChange = (val: string) => {
    setPickup(val);
    if (val.length > 1) {
      setPickupSuggestions(popularPlaces.filter(p => p.toLowerCase().includes(val.toLowerCase())).slice(0, 4));
      setShowPickupSug(true);
    } else {
      setShowPickupSug(false);
    }
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    if (val.length > 1) {
      setDestSuggestions(popularPlaces.filter(p => p.toLowerCase().includes(val.toLowerCase())).slice(0, 4));
      setShowDestSug(true);
    } else {
      setShowDestSug(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setPickup("Mi ubicación actual 📍"),
      () => setPickup("Ubicación no disponible")
    );
  };

  const handleSeePrice = () => {
    if (!pickup.trim() || !destination.trim()) return;
    // Simulate distance calculation (3-35 km)
    const km = Math.round(Math.random() * 25 + 5);
    const vehicle = VEHICLES.find(v => v.id === selectedVehicle)!;
    const price = Math.round((vehicle.base + vehicle.perKm * km) * 100) / 100;
    const minutes = Math.round(km * 2.2 + 5);
    setEstimate({ price, km, minutes });
    setStep("estimate");
  };

  const handleRequestTrip = () => {
    if (isAuthenticated) {
      // Save trip to sessionStorage and go to dashboard
      sessionStorage.setItem("pendingTrip", JSON.stringify({ pickup, destination, vehicle: selectedVehicle, estimate }));
      navigate("/client-dashboard");
    } else {
      setStep("register");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError("Completa todos los campos");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setRegLoading(true);
    setRegError("");
    try {
      const nameParts = regName.trim().split(" ");
      await register({ firstName: nameParts[0], lastName: nameParts.slice(1).join(" ") || undefined, email: `${regPhone.replace(/\D/g, "")}@whatsapptaxi.app`, phone: regPhone, password: regPassword, role: "client" });
      sessionStorage.setItem("pendingTrip", JSON.stringify({ pickup, destination, vehicle: selectedVehicle, estimate }));
      navigate("/client-dashboard");
    } catch (err: any) {
      setRegError(err.message || "Error al registrarse. Intenta de nuevo.");
    } finally {
      setRegLoading(false);
    }
  };

  const vehicle = VEHICLES.find(v => v.id === selectedVehicle)!;

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, oklch(0.10 0.01 250) 0%, oklch(0.14 0.02 200) 60%, oklch(0.10 0.01 250) 100%)` }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, oklch(0.76 0.18 148) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.52 0.12 148) 0%, transparent 50%)" }} />

      <div className="container relative z-10 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: "oklch(0.76 0.18 148 / 0.15)", color: "oklch(0.76 0.18 148)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.76_0.18_148)] animate-pulse" />
              Conductores disponibles ahora
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.08] mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Tu taxi,<br />
              <span style={{ color: "oklch(0.76 0.18 148)" }}>en minutos.</span>
            </h1>
            <p className="text-white/60 text-lg lg:text-xl mb-8 leading-relaxed">
              Pide tu viaje ahora mismo. Sin apps, sin complicaciones. Solo dinos dónde estás y a dónde vas.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: Shield, text: "Conductores verificados" },
                { icon: Star, text: "4.9 / 5.0 promedio" },
                { icon: Zap, text: "Llegada en 3-8 min" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/50 text-sm">
                  <Icon size={14} style={{ color: "oklch(0.76 0.18 148)" }} />
                  {text}
                </div>
              ))}
            </div>

            {/* Secondary links */}
            <div className="flex items-center gap-4 text-sm">
              <a href="/register?role=driver" className="text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5">
                <Car size={14} />
                ¿Eres conductor? Únete
              </a>
              <span className="text-white/20">·</span>
              <a href="/register?role=fleet" className="text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5">
                <Users size={14} />
                Gestiona tu flotilla
              </a>
            </div>
          </div>

          {/* RIGHT — Trip form card */}
          <div>
            <div
              className="rounded-3xl p-6 shadow-2xl"
              style={{ background: "oklch(0.98 0.005 100)", boxShadow: "0 32px 80px oklch(0 0 0 / 0.5)" }}
            >
              {step === "form" && (
                <>
                  <h2 className="text-xl font-bold text-[oklch(0.14_0.01_250)] mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
                    ¿A dónde vas hoy?
                  </h2>

                  {/* Pickup */}
                  <div className="relative mb-3">
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-colors" style={{ borderColor: pickup ? "oklch(0.76 0.18 148)" : "oklch(0.90 0.005 100)", background: "white" }}>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "oklch(0.76 0.18 148)" }} />
                      <input
                        type="text"
                        value={pickup}
                        onChange={e => handlePickupChange(e.target.value)}
                        onFocus={() => pickup.length > 1 && setShowPickupSug(true)}
                        onBlur={() => setTimeout(() => setShowPickupSug(false), 150)}
                        placeholder="¿Dónde te recogemos?"
                        className="flex-1 outline-none text-sm text-[oklch(0.14_0.01_250)] placeholder-[oklch(0.65_0.01_80)] bg-transparent"
                      />
                      <button onClick={handleGetLocation} className="text-[oklch(0.52_0.12_148)] hover:text-[oklch(0.76_0.18_148)] transition-colors flex-shrink-0" title="Usar mi ubicación">
                        <Navigation size={16} />
                      </button>
                    </div>
                    {showPickupSug && pickupSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        {pickupSuggestions.map(s => (
                          <button key={s} onMouseDown={() => { setPickup(s); setShowPickupSug(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors">
                            <MapPin size={14} className="text-[oklch(0.52_0.12_148)] flex-shrink-0" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="relative mb-3">
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-colors" style={{ borderColor: destination ? "oklch(0.52 0.12 148)" : "oklch(0.90 0.005 100)", background: "white" }}>
                      <div className="w-3 h-3 rounded-full flex-shrink-0 border-2" style={{ borderColor: "oklch(0.52 0.12 148)" }} />
                      <input
                        type="text"
                        value={destination}
                        onChange={e => handleDestChange(e.target.value)}
                        onFocus={() => destination.length > 1 && setShowDestSug(true)}
                        onBlur={() => setTimeout(() => setShowDestSug(false), 150)}
                        placeholder="¿A dónde vas?"
                        className="flex-1 outline-none text-sm text-[oklch(0.14_0.01_250)] placeholder-[oklch(0.65_0.01_80)] bg-transparent"
                      />
                    </div>
                    {showDestSug && destSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        {destSuggestions.map(s => (
                          <button key={s} onMouseDown={() => { setDestination(s); setShowDestSug(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors">
                            <MapPin size={14} className="text-[oklch(0.52_0.12_148)] flex-shrink-0" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Time selector */}
                  <div className="flex gap-2 mb-4">
                    {[{ id: "now", label: "Ahora" }, { id: "scheduled", label: "Programar" }].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setTripTime(opt.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ background: tripTime === opt.id ? "oklch(0.76 0.18 148 / 0.15)" : "oklch(0.95 0.005 100)", color: tripTime === opt.id ? "oklch(0.52 0.12 148)" : "oklch(0.55 0.01 80)", border: tripTime === opt.id ? "1.5px solid oklch(0.76 0.18 148 / 0.4)" : "1.5px solid transparent" }}
                      >
                        <Clock size={13} />
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSeePrice}
                    disabled={!pickup.trim() || !destination.trim()}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))", color: "white", boxShadow: pickup && destination ? "0 8px 24px oklch(0.52 0.12 148 / 0.4)" : "none" }}
                  >
                    Ver precios disponibles
                    <ChevronRight size={18} />
                  </button>

                  <p className="text-center text-[oklch(0.65_0.01_80)] text-xs mt-3">Sin cargos hasta confirmar el viaje</p>
                </>
              )}

              {step === "estimate" && estimate && (
                <>
                  {/* Back button */}
                  <button onClick={() => setStep("form")} className="flex items-center gap-1.5 text-sm text-[oklch(0.55_0.01_80)] hover:text-[oklch(0.14_0.01_250)] mb-4 transition-colors">
                    ← Cambiar ruta
                  </button>

                  {/* Route summary */}
                  <div className="p-4 rounded-2xl mb-4" style={{ background: "oklch(0.97 0.005 148 / 0.5)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(0.76 0.18 148)" }} />
                        <div className="w-0.5 h-6" style={{ background: "oklch(0.76 0.18 148 / 0.3)" }} />
                        <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: "oklch(0.52 0.12 148)" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[oklch(0.14_0.01_250)] truncate">{pickup}</p>
                        <p className="text-xs text-[oklch(0.65_0.01_80)] mt-3 truncate">{destination}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[oklch(0.65_0.01_80)]">{estimate.km} km</p>
                        <p className="text-xs text-[oklch(0.65_0.01_80)] mt-3">{estimate.minutes} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle selector */}
                  <p className="text-xs font-semibold text-[oklch(0.55_0.01_80)] uppercase tracking-wider mb-2">Elige tu vehículo</p>
                  <div className="flex flex-col gap-2 mb-4">
                    {VEHICLES.map(v => {
                      const price = Math.round((v.base + v.perKm * estimate.km) * 100) / 100;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVehicle(v.id)}
                          className="flex items-center gap-3 p-3 rounded-2xl transition-all text-left"
                          style={{ background: selectedVehicle === v.id ? "oklch(0.97 0.005 148 / 0.6)" : "white", border: selectedVehicle === v.id ? "2px solid oklch(0.76 0.18 148)" : "2px solid oklch(0.92 0.005 100)" }}
                        >
                          <span className="text-2xl">{v.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[oklch(0.14_0.01_250)]">{v.label}</p>
                            <p className="text-xs text-[oklch(0.65_0.01_80)]">{v.eta} · {v.seats} asientos</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold" style={{ color: selectedVehicle === v.id ? "oklch(0.52 0.12 148)" : "oklch(0.14 0.01 250)" }}>${price.toFixed(2)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Request button */}
                  <button
                    onClick={handleRequestTrip}
                    className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))", boxShadow: "0 8px 24px oklch(0.52 0.12 148 / 0.4)" }}
                  >
                    Pedir {vehicle.emoji} {vehicle.label} — ${(vehicle.base + vehicle.perKm * estimate.km).toFixed(2)}
                  </button>
                  <p className="text-center text-[oklch(0.65_0.01_80)] text-xs mt-2">Al continuar aceptas los términos del servicio</p>
                </>
              )}

              {step === "register" && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-[oklch(0.14_0.01_250)]" style={{ fontFamily: "'Sora', sans-serif" }}>
                        Casi listo 🎉
                      </h2>
                      <p className="text-sm text-[oklch(0.55_0.01_80)] mt-0.5">Crea tu cuenta para confirmar el viaje</p>
                    </div>
                    <button onClick={() => setStep("estimate")} className="text-[oklch(0.65_0.01_80)] hover:text-[oklch(0.14_0.01_250)] transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Trip recap */}
                  <div className="p-3 rounded-xl mb-5 flex items-center gap-3" style={{ background: "oklch(0.97 0.005 148 / 0.4)", border: "1px solid oklch(0.76 0.18 148 / 0.2)" }}>
                    <span className="text-xl">{vehicle.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[oklch(0.55_0.01_80)] truncate">{pickup} → {destination}</p>
                      <p className="text-sm font-bold" style={{ color: "oklch(0.52 0.12 148)" }}>{vehicle.label} · ${estimate ? (vehicle.base + vehicle.perKm * estimate.km).toFixed(2) : "--"}</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3.5 rounded-2xl border-2 text-sm outline-none transition-colors"
                      style={{ borderColor: regName ? "oklch(0.76 0.18 148)" : "oklch(0.90 0.005 100)" }}
                    />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="Número de teléfono / WhatsApp"
                      className="w-full px-4 py-3.5 rounded-2xl border-2 text-sm outline-none transition-colors"
                      style={{ borderColor: regPhone ? "oklch(0.76 0.18 148)" : "oklch(0.90 0.005 100)" }}
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Contraseña (mín. 6 caracteres)"
                        className="w-full px-4 py-3.5 rounded-2xl border-2 text-sm outline-none transition-colors pr-12"
                        style={{ borderColor: regPassword ? "oklch(0.76 0.18 148)" : "oklch(0.90 0.005 100)" }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[oklch(0.65_0.01_80)]">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {regError && (
                      <div className="px-4 py-2.5 rounded-xl text-sm text-red-700" style={{ background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.85 0.05 25)" }}>
                        {regError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))", boxShadow: "0 8px 24px oklch(0.52 0.12 148 / 0.4)" }}
                    >
                      {regLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                      {regLoading ? "Creando cuenta..." : "Confirmar viaje →"}
                    </button>
                  </form>

                  <p className="text-center text-[oklch(0.65_0.01_80)] text-xs mt-3">
                    ¿Ya tienes cuenta?{" "}
                    <a href="/login" className="font-semibold" style={{ color: "oklch(0.52 0.12 148)" }}>Inicia sesión</a>
                  </p>
                </>
              )}
            </div>

            {/* Social proof below card */}
            <div className="flex items-center justify-center gap-6 mt-5">
              <div className="flex -space-x-2">
                {["🧑", "👩", "👨", "🧕"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-sm" style={{ background: "oklch(0.20 0.01 250)" }}>{e}</div>
                ))}
              </div>
              <p className="text-white/50 text-sm">
                <span className="text-white font-semibold">2,400+</span> clientes activos esta semana
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
