/**
 * HeroSection — 100% nativo: Leaflet + OpenStreetMap + Nominatim
 * Sin dependencia de Google Maps
 */
import { useState, useRef, useCallback } from "react";
import { Navigation, Clock, ChevronRight, Shield, Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import LeafletMap, { type LeafletMapRef } from "@/components/LeafletMap";
import NominatimAutocomplete from "@/components/NominatimAutocomplete";

const VEHICLES = [
  { id: "economy", label: "Económico", emoji: "🚗", base: 6,  perKm: 0.9, eta: "3 min", seats: 4 },
  { id: "comfort",  label: "Confort",   emoji: "🚙", base: 9,  perKm: 1.3, eta: "5 min", seats: 4 },
  { id: "premium",  label: "Premium",   emoji: "🚘", base: 14, perKm: 1.8, eta: "7 min", seats: 4 },
  { id: "suv",      label: "SUV",       emoji: "🚐", base: 18, perKm: 2.2, eta: "8 min", seats: 6 },
];

const EXTRAS = [
  { id: "pet",        label: "Mascota",        icon: "🐾", price: 2 },
  { id: "luggage",    label: "Maletas",         icon: "🧳", price: 1 },
  { id: "child_seat", label: "Silla de niño",   icon: "👶", price: 3 },
  { id: "wheelchair", label: "Silla de ruedas", icon: "♿", price: 0 },
  { id: "music",      label: "Música a gusto",  icon: "🎵", price: 0 },
];

export default function HeroSection() {
  const [, navigate] = useLocation();
  const { config } = useSiteConfig();
  const { isAuthenticated, register } = useLocalAuth();

  const [pickup, setPickup]           = useState("");
  const [destination, setDestination] = useState("");
  const [tripTime, setTripTime]       = useState<"now" | "later">("now");
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [selectedExtras, setSelectedExtras]   = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "estimate" | "register">("form");
  const [estimate, setEstimate] = useState<{ price: number; km: number; minutes: number } | null>(null);
  const [calculating, setCalculating] = useState(false);

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords,   setDestCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<LeafletMapRef | null>(null);

  const [regName, setRegName]         = useState("");
  const [regPhone, setRegPhone]       = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regLoading, setRegLoading]   = useState(false);
  const [regError, setRegError]       = useState("");

  const handleMapReady = useCallback((ref: LeafletMapRef) => {
    mapRef.current = ref;
    // Try to get user location
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setPickupCoords({ lat, lng });
      ref.setPickup(lat, lng, "Mi ubicación");
      // Reverse geocode with Nominatim
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { "Accept-Language": "es" } });
        const data = await res.json();
        if (data.display_name) setPickup(data.display_name.split(",").slice(0, 2).join(","));
        else setPickup("Mi ubicación actual 📍");
      } catch { setPickup("Mi ubicación actual 📍"); }
    });
  }, []);

  const handleGetMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setPickupCoords({ lat, lng });
      mapRef.current?.setPickup(lat, lng, "Mi ubicación");
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { "Accept-Language": "es" } });
        const data = await res.json();
        setPickup(data.display_name?.split(",").slice(0, 2).join(",") || "Mi ubicación 📍");
      } catch { setPickup("Mi ubicación 📍"); }
    }, () => alert("Activa la ubicación en tu navegador"));
  };

  const handleCalculate = async () => {
    if (!pickup || !destination) return;
    setCalculating(true);
    let km = 5; let minutes = 12;
    if (pickupCoords && destCoords) {
      mapRef.current?.setDropoff(destCoords.lat, destCoords.lng, destination);
      const route = await mapRef.current?.getRoute();
      if (route) { km = parseFloat(route.distanceKm.toFixed(1)); minutes = route.durationMin; }
    }
    const v = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[0];
    const extrasTotal = selectedExtras.reduce((sum, id) => sum + (EXTRAS.find(e => e.id === id)?.price || 0), 0);
    const price = parseFloat((v.base + km * v.perKm + extrasTotal).toFixed(2));
    setEstimate({ price, km, minutes });
    setStep("estimate");
    setCalculating(false);
  };

  const handleRequestTrip = () => {
    if (isAuthenticated) {
      sessionStorage.setItem("pendingTrip", JSON.stringify({ pickup, destination, vehicle: selectedVehicle, extras: selectedExtras, estimate }));
      navigate("/client-dashboard");
    } else {
      setStep("register");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true); setRegError("");
    const nameParts = regName.trim().split(" ");
    const result = await register({ firstName: nameParts[0], lastName: nameParts.slice(1).join(" ") || undefined, email: `${regPhone.replace(/\D/g, "")}@taxi.app`, phone: regPhone, password: regPassword, role: "client" });
    setRegLoading(false);
    if (!result.success) { setRegError(result.error || "Error al registrar"); return; }
    sessionStorage.setItem("pendingTrip", JSON.stringify({ pickup, destination, vehicle: selectedVehicle, extras: selectedExtras, estimate }));
    navigate("/client-dashboard");
  };

  const v = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[0];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.10 0.01 250) 0%, oklch(0.14 0.02 200) 100%)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.76 0.18 148)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: "oklch(0.52 0.12 148)" }} />
      </div>

      <div className="container relative z-10 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Copy */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "oklch(0.76 0.18 148 / 0.15)", color: "oklch(0.76 0.18 148)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "oklch(0.76 0.18 148)" }} />
              Conductores disponibles ahora
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
              Tu taxi,<br /><span style={{ color: "oklch(0.76 0.18 148)" }}>en minutos.</span>
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-md">
              Sin apps, sin complicaciones. Solo dinos dónde estás y a dónde vas.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[{ icon: Shield, text: "Conductores verificados" }, { icon: Zap, text: "Llegada en 3-8 min" }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon size={15} style={{ color: "oklch(0.76 0.18 148)" }} /> {text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-white/40 text-sm">
              <a href="#conductores" className="hover:text-white/70 transition-colors flex items-center gap-1.5"><span>🚗</span> ¿Eres conductor? Únete</a>
              <span>·</span>
              <a href="#flotilla" className="hover:text-white/70 transition-colors flex items-center gap-1.5"><span>🏢</span> Gestiona tu flotilla</a>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="order-1 lg:order-2">
            <div className="rounded-3xl p-6 shadow-2xl shadow-black/40" style={{ background: "white" }}>
              {step === "form" && (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>¿A dónde vas hoy?</h2>

                  {/* Pickup */}
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <NominatimAutocomplete
                          placeholder="¿Dónde te recogemos?"
                          value={pickup}
                          onChange={setPickup}
                          onSelect={(addr, lat, lng) => { setPickupCoords({ lat, lng }); mapRef.current?.setPickup(lat, lng, addr); }}
                          icon={<span className="w-3 h-3 rounded-full inline-block" style={{ background: "oklch(0.76 0.18 148)" }} />}
                        />
                      </div>
                      <button onClick={handleGetMyLocation} className="px-3 py-3 rounded-xl border border-slate-200 hover:bg-green-50 transition-colors" title="Usar mi ubicación">
                        <Navigation size={16} className="text-green-500" />
                      </button>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="mb-4">
                    <NominatimAutocomplete
                      placeholder="¿A dónde vas?"
                      value={destination}
                      onChange={setDestination}
                      onSelect={(addr, lat, lng) => { setDestCoords({ lat, lng }); mapRef.current?.setDropoff(lat, lng, addr); }}
                      icon={<span className="w-3 h-3 rounded-full border-2 inline-block" style={{ borderColor: "#EF4444" }} />}
                    />
                  </div>

                  {/* Time */}
                  <div className="flex gap-2 mb-4">
                    {(["now", "later"] as const).map(t => (
                      <button key={t} onClick={() => setTripTime(t)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tripTime === t ? "border-green-500 text-green-700 bg-green-50" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                        <Clock size={13} /> {t === "now" ? "Ahora" : "Programar"}
                      </button>
                    ))}
                  </div>

                  {/* Extras */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Requisitos especiales</p>
                    <div className="flex flex-wrap gap-2">
                      {EXTRAS.map(ex => (
                        <button key={ex.id} onClick={() => setSelectedExtras(prev => prev.includes(ex.id) ? prev.filter(x => x !== ex.id) : [...prev, ex.id])}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedExtras.includes(ex.id) ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                          {ex.icon} {ex.label} <span className="text-slate-400">{ex.price > 0 ? `+$${ex.price}` : "+$0"}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Map preview */}
                  <div className="rounded-2xl overflow-hidden mb-4" style={{ height: 160 }}>
                    <LeafletMap height="160px" onMapReady={handleMapReady} />
                  </div>

                  <button onClick={handleCalculate} disabled={!pickup || !destination || calculating}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
                    {calculating ? <><Loader2 size={16} className="animate-spin" /> Calculando ruta...</> : <>Ver precios disponibles <ChevronRight size={16} /></>}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-2">Sin cargos hasta confirmar el viaje</p>
                </>
              )}

              {step === "estimate" && estimate && (
                <>
                  <button onClick={() => setStep("form")} className="text-xs text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">← Cambiar</button>
                  <h2 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Tu viaje estimado</h2>
                  <p className="text-slate-500 text-sm mb-4">{pickup} → {destination}</p>
                  <div className="flex gap-3 mb-4 text-sm">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">📍 {estimate.km} km</span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">⏱ {estimate.minutes} min</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {VEHICLES.map(vh => {
                      const extrasTotal = selectedExtras.reduce((s, id) => s + (EXTRAS.find(e => e.id === id)?.price || 0), 0);
                      const p = (vh.base + estimate.km * vh.perKm + extrasTotal).toFixed(2);
                      return (
                        <button key={vh.id} onClick={() => setSelectedVehicle(vh.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${selectedVehicle === vh.id ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <p className="text-lg">{vh.emoji}</p>
                          <p className="text-xs font-semibold text-slate-700">{vh.label}</p>
                          <p className="text-base font-extrabold text-slate-900">${p}</p>
                          <p className="text-xs text-slate-400">{vh.eta}</p>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={handleRequestTrip}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
                    Pedir {v.emoji} {v.label} · ${(v.base + estimate.km * v.perKm + selectedExtras.reduce((s, id) => s + (EXTRAS.find(e => e.id === id)?.price || 0), 0)).toFixed(2)} <ChevronRight size={16} />
                  </button>
                </>
              )}

              {step === "register" && (
                <>
                  <button onClick={() => setStep("estimate")} className="text-xs text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">← Volver</button>
                  <h2 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Casi listo 🚕</h2>
                  <p className="text-slate-500 text-sm mb-4">Crea tu cuenta para confirmar el viaje</p>
                  {estimate && (
                    <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: "oklch(0.76 0.18 148 / 0.1)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}>
                      <p className="font-semibold text-slate-800">{v.emoji} {v.label} · ${(v.base + estimate.km * v.perKm + selectedExtras.reduce((s, id) => s + (EXTRAS.find(e => e.id === id)?.price || 0), 0)).toFixed(2)}</p>
                      <p className="text-slate-500 text-xs">{pickup} → {destination}</p>
                    </div>
                  )}
                  {regError && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">{regError}</div>}
                  <form onSubmit={handleRegister} className="space-y-3">
                    <input type="text" required placeholder="Tu nombre completo" value={regName} onChange={e => setRegName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none" />
                    <input type="tel" required placeholder="Número de teléfono" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none" />
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required placeholder="Contraseña (mín. 6 caracteres)" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button type="submit" disabled={regLoading}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
                      {regLoading ? <><Loader2 size={16} className="animate-spin" /> Creando cuenta...</> : <>Confirmar viaje <ChevronRight size={16} /></>}
                    </button>
                  </form>
                  <p className="text-center text-xs text-slate-400 mt-3">¿Ya tienes cuenta? <a href="/login" className="text-green-600 hover:underline">Inicia sesión</a></p>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex -space-x-2">
                {["🧑","👩","👨","🧑‍🦱"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-sm" style={{ background: "oklch(0.20 0.02 200)" }}>{e}</div>
                ))}
              </div>
              <p className="text-white/50 text-sm"><span className="text-white font-bold">2,400+</span> clientes activos esta semana</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
