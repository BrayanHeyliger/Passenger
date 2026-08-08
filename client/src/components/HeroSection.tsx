/**
 * HeroSection — Responsive (mobile/tablet/desktop/PWA) + Google Places + requisitos especiales
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Navigation, Clock, ChevronRight, Star, Shield, Zap, X, Eye, EyeOff, Loader2, Car, Users, PawPrint, Luggage, Baby, Accessibility, Music } from "lucide-react";
import { useLocation } from "wouter";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { MapView } from "@/components/Map";

/// <reference types="@types/google.maps" />

const VEHICLES = [
  { id: "economy", label: "Económico", emoji: "🚗", base: 6, perKm: 0.9, eta: "3 min", seats: 4 },
  { id: "comfort",  label: "Confort",   emoji: "🚙", base: 9,  perKm: 1.3, eta: "5 min", seats: 4 },
  { id: "premium",  label: "Premium",   emoji: "🚘", base: 14, perKm: 1.8, eta: "7 min", seats: 4 },
  { id: "suv",      label: "SUV",       emoji: "🚐", base: 18, perKm: 2.2, eta: "8 min", seats: 6 },
];

const EXTRAS = [
  { id: "pet",        label: "Mascota",        icon: "🐾", note: "+$2" },
  { id: "luggage",    label: "Maletas",         icon: "🧳", note: "+$1" },
  { id: "child_seat", label: "Silla de niño",   icon: "👶", note: "+$3" },
  { id: "wheelchair", label: "Silla de ruedas", icon: "♿", note: "+$0" },
  { id: "music",      label: "Música a gusto",  icon: "🎵", note: "+$0" },
];

export default function HeroSection() {
  const [, navigate] = useLocation();
  const { config } = useSiteConfig();
  const { isAuthenticated, register } = useLocalAuth();

  const [pickup, setPickup]           = useState("");
  const [destination, setDestination] = useState("");
  const [tripTime, setTripTime]       = useState("now");
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [selectedExtras, setSelectedExtras]   = useState<string[]>([]);
  const [step, setStep] = useState<"form" | "estimate" | "register">("form");
  const [estimate, setEstimate] = useState<{ price: number; km: number; minutes: number } | null>(null);

  const [pickupSuggestions, setPickupSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [destSuggestions,   setDestSuggestions]   = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPickupSug, setShowPickupSug] = useState(false);
  const [showDestSug,   setShowDestSug]   = useState(false);
  const [pickupCoords, setPickupCoords]   = useState<google.maps.LatLngLiteral | null>(null);
  const [destCoords,   setDestCoords]     = useState<google.maps.LatLngLiteral | null>(null);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder            = useRef<google.maps.Geocoder | null>(null);
  const mapRef              = useRef<google.maps.Map | null>(null);
  const directionsRenderer  = useRef<google.maps.DirectionsRenderer | null>(null);
  const mapsReady           = useRef(false);

  const [regName, setRegName]         = useState("");
  const [regPhone, setRegPhone]       = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regLoading, setRegLoading]   = useState(false);
  const [regError, setRegError]       = useState("");

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    mapsReady.current = true;
    autocompleteService.current = new google.maps.places.AutocompleteService();
    geocoder.current = new google.maps.Geocoder();
    directionsRenderer.current = new google.maps.DirectionsRenderer({
      map,
      polylineOptions: { strokeColor: "#25D366", strokeWeight: 5 },
    });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickupCoords(coords);
        map.setCenter(coords);
        geocoder.current?.geocode({ location: coords }, (res, st) => {
          if (st === "OK" && res?.[0]) setPickup(res[0].formatted_address);
          else setPickup("Mi ubicación actual 📍");
        });
      });
    }
  }, []);

  const fetchSuggestions = (input: string, setter: (s: google.maps.places.AutocompletePrediction[]) => void) => {
    if (!autocompleteService.current || input.length < 2) { setter([]); return; }
    autocompleteService.current.getPlacePredictions(
      { input, types: ["geocode", "establishment"] },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) setter(predictions.slice(0, 5));
        else setter([]);
      }
    );
  };

  const geocodePlace = (placeId: string, cb: (c: google.maps.LatLngLiteral) => void) => {
    geocoder.current?.geocode({ placeId }, (res, st) => {
      if (st === "OK" && res?.[0]) { const l = res[0].geometry.location; cb({ lat: l.lat(), lng: l.lng() }); }
    });
  };

  // Draw route when both coords ready
  useEffect(() => {
    if (!pickupCoords || !destCoords || !mapRef.current || !mapsReady.current) return;
    new google.maps.DirectionsService().route(
      { origin: pickupCoords, destination: destCoords, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === "OK" && result && directionsRenderer.current) {
          directionsRenderer.current.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            const km = (leg.distance?.value || 0) / 1000;
            const minutes = Math.round((leg.duration?.value || 0) / 60);
            const v = VEHICLES.find(v => v.id === selectedVehicle)!;
            setEstimate({ price: Math.round((v.base + v.perKm * km) * 100) / 100, km: Math.round(km * 10) / 10, minutes });
          }
        }
      }
    );
  }, [pickupCoords, destCoords, selectedVehicle]);

  const extraCost = selectedExtras.reduce((acc, id) => {
    const e = EXTRAS.find(x => x.id === id);
    return acc + (e ? parseInt(e.note.replace(/[^0-9]/g, "") || "0") : 0);
  }, 0);

  const toggleExtra = (id: string) =>
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSeePrice = () => {
    if (!pickup.trim() || !destination.trim()) return;
    if (!estimate) {
      const km = Math.round(Math.random() * 20 + 5);
      const v = VEHICLES.find(v => v.id === selectedVehicle)!;
      setEstimate({ price: Math.round((v.base + v.perKm * km) * 100) / 100, km, minutes: Math.round(km * 2.2 + 5) });
    }
    setStep("estimate");
  };

  const handleRequestTrip = () => {
    const tripData = { pickup, destination, vehicle: selectedVehicle, extras: selectedExtras, estimate };
    sessionStorage.setItem("pendingTrip", JSON.stringify(tripData));
    if (isAuthenticated) navigate("/client-dashboard");
    else setStep("register");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) { setRegError("Completa todos los campos"); return; }
    if (regPassword.length < 6) { setRegError("Mínimo 6 caracteres"); return; }
    setRegLoading(true); setRegError("");
    try {
      const parts = regName.trim().split(" ");
      await register({ firstName: parts[0], lastName: parts.slice(1).join(" ") || undefined, email: `${regPhone.replace(/\D/g, "")}@whatsapptaxi.app`, phone: regPhone, password: regPassword, role: "client" });
      navigate("/client-dashboard");
    } catch (err: any) {
      setRegError(err.message || "Error al registrarse");
    } finally {
      setRegLoading(false);
    }
  };

  const vehicle = VEHICLES.find(v => v.id === selectedVehicle)!;
  const totalPrice = estimate ? (estimate.price + extraCost) : null;

  return (
    <section className="relative flex items-start lg:items-center overflow-hidden" style={{ minHeight: "100svh", background: "linear-gradient(135deg, oklch(0.10 0.01 250) 0%, oklch(0.14 0.02 200) 60%, oklch(0.10 0.01 250) 100%)" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, oklch(0.76 0.18 148) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.52 0.12 148) 0%, transparent 50%)" }} />

      {/* Hidden map init */}
      <div className="absolute opacity-0 pointer-events-none" style={{ width: 1, height: 1, overflow: "hidden" }}>
        <MapView onMapReady={handleMapReady} initialZoom={13} />
      </div>

      <div className="container relative z-10 py-20 lg:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start lg:items-center">

          {/* LEFT */}
          <div className="order-2 lg:order-1 hidden lg:block">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: "oklch(0.76 0.18 148 / 0.15)", color: "oklch(0.76 0.18 148)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.76_0.18_148)] animate-pulse" />
              Conductores disponibles ahora
            </div>
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Tu taxi,<br /><span style={{ color: "oklch(0.76 0.18 148)" }}>en minutos.</span>
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">Sin apps, sin complicaciones. Solo dinos dónde estás y a dónde vas.</p>
            <div className="flex flex-wrap gap-4 mb-8">
              {[{ icon: Shield, text: "Conductores verificados" }, { icon: Star, text: "4.9 / 5.0 promedio" }, { icon: Zap, text: "Llegada en 3-8 min" }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/50 text-sm">
                  <Icon size={14} style={{ color: "oklch(0.76 0.18 148)" }} />
                  {text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="/register?role=driver" className="text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"><Car size={14} />¿Eres conductor? Únete</a>
              <span className="text-white/20">·</span>
              <a href="/register?role=fleet" className="text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"><Users size={14} />Gestiona tu flotilla</a>
            </div>
          </div>

          {/* RIGHT — Card */}
          <div className="order-1 lg:order-2 w-full">
            {/* Mobile headline */}
            <div className="lg:hidden text-center mb-6 pt-4">
              <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
                Tu taxi, <span style={{ color: "oklch(0.76 0.18 148)" }}>en minutos.</span>
              </h1>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "white", boxShadow: "0 24px 60px oklch(0 0 0 / 0.45)" }}>

              {/* Mini map */}
              {step === "estimate" && (pickupCoords || destCoords) && (
                <div className="relative" style={{ height: 160 }}>
                  <MapView
                    onMapReady={(map) => {
                      mapRef.current = map; mapsReady.current = true;
                      directionsRenderer.current = new google.maps.DirectionsRenderer({ map, polylineOptions: { strokeColor: "#25D366", strokeWeight: 5 } });
                      if (pickupCoords && destCoords) {
                        new google.maps.DirectionsService().route({ origin: pickupCoords, destination: destCoords, travelMode: google.maps.TravelMode.DRIVING }, (res, st) => {
                          if (st === "OK" && res && directionsRenderer.current) directionsRenderer.current.setDirections(res);
                        });
                      }
                    }}
                    initialCenter={pickupCoords || { lat: 10.4806, lng: -66.9036 }}
                    initialZoom={12}
                    className="w-full h-full"
                  />
                  {estimate && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                      {[`📍 ${estimate.km} km`, `⏱ ${estimate.minutes} min`].map(t => (
                        <div key={t} className="flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white text-center" style={{ background: "oklch(0.14 0.01 250 / 0.82)", backdropFilter: "blur(6px)" }}>{t}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-5">
                {/* ── STEP: FORM ── */}
                {step === "form" && (
                  <>
                    <h2 className="text-lg font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>¿A dónde vas hoy?</h2>

                    {/* Pickup */}
                    <div className="relative mb-2.5">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-white transition-colors" style={{ borderColor: pickup ? "#25D366" : "#e2e8f0" }}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0 bg-[#25D366]" />
                        <input type="text" value={pickup} onChange={e => { setPickup(e.target.value); fetchSuggestions(e.target.value, setPickupSuggestions); setShowPickupSug(true); }} onFocus={() => pickup.length > 1 && setShowPickupSug(true)} onBlur={() => setTimeout(() => setShowPickupSug(false), 200)} placeholder="¿Dónde te recogemos?" className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent min-w-0" />
                        <button onClick={() => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(pos => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setPickupCoords(c); geocoder.current?.geocode({ location: c }, (r, s) => { if (s === "OK" && r?.[0]) setPickup(r[0].formatted_address); else setPickup("Mi ubicación 📍"); }); }); }} className="text-[#25D366] flex-shrink-0"><Navigation size={15} /></button>
                      </div>
                      {showPickupSug && pickupSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                          {pickupSuggestions.map(s => (
                            <button key={s.place_id} onMouseDown={() => { setPickup(s.description); setShowPickupSug(false); geocodePlace(s.place_id, c => { setPickupCoords(c); mapRef.current?.setCenter(c); }); }} className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                              <MapPin size={13} className="text-[#25D366] flex-shrink-0 mt-0.5" />
                              <div><p className="text-xs font-medium text-slate-800">{s.structured_formatting?.main_text}</p><p className="text-xs text-slate-400">{s.structured_formatting?.secondary_text}</p></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Destination */}
                    <div className="relative mb-3">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-white transition-colors" style={{ borderColor: destination ? "#128C7E" : "#e2e8f0" }}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-[#128C7E]" />
                        <input type="text" value={destination} onChange={e => { setDestination(e.target.value); fetchSuggestions(e.target.value, setDestSuggestions); setShowDestSug(true); }} onFocus={() => destination.length > 1 && setShowDestSug(true)} onBlur={() => setTimeout(() => setShowDestSug(false), 200)} placeholder="¿A dónde vas?" className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent min-w-0" />
                      </div>
                      {showDestSug && destSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                          {destSuggestions.map(s => (
                            <button key={s.place_id} onMouseDown={() => { setDestination(s.description); setShowDestSug(false); geocodePlace(s.place_id, c => setDestCoords(c)); }} className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                              <MapPin size={13} className="text-[#128C7E] flex-shrink-0 mt-0.5" />
                              <div><p className="text-xs font-medium text-slate-800">{s.structured_formatting?.main_text}</p><p className="text-xs text-slate-400">{s.structured_formatting?.secondary_text}</p></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex gap-2 mb-3">
                      {[{ id: "now", label: "Ahora" }, { id: "scheduled", label: "Programar" }].map(opt => (
                        <button key={opt.id} onClick={() => setTripTime(opt.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all" style={{ background: tripTime === opt.id ? "#25D366" + "22" : "#f1f5f9", color: tripTime === opt.id ? "#128C7E" : "#64748b", border: tripTime === opt.id ? "1.5px solid #25D36644" : "1.5px solid transparent" }}>
                          <Clock size={12} />{opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Extras */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Requisitos especiales</p>
                      <div className="flex flex-wrap gap-2">
                        {EXTRAS.map(ex => (
                          <button key={ex.id} onClick={() => toggleExtra(ex.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all" style={{ background: selectedExtras.includes(ex.id) ? "#25D366" + "22" : "#f8fafc", color: selectedExtras.includes(ex.id) ? "#128C7E" : "#64748b", border: selectedExtras.includes(ex.id) ? "1.5px solid #25D36655" : "1.5px solid #e2e8f0" }}>
                            <span>{ex.icon}</span>{ex.label}<span className="opacity-60">{ex.note}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleSeePrice} disabled={!pickup.trim() || !destination.trim()} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: pickup && destination ? "0 6px 20px #25D36644" : "none" }}>
                      Ver precios disponibles <ChevronRight size={16} />
                    </button>
                    <p className="text-center text-slate-400 text-xs mt-2">Sin cargos hasta confirmar el viaje</p>
                  </>
                )}

                {/* ── STEP: ESTIMATE ── */}
                {step === "estimate" && estimate && (
                  <>
                    <button onClick={() => setStep("form")} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-3 transition-colors">← Cambiar ruta</button>
                    <div className="p-3 rounded-2xl mb-3" style={{ background: "#f0fdf4", border: "1px solid #25D36633" }}>
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                          <div className="w-0.5 h-5 bg-[#25D36633]" />
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-[#128C7E]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{pickup}</p>
                          <p className="text-xs text-slate-400 mt-3 truncate">{destination}</p>
                        </div>
                        <div className="text-right flex-shrink-0 text-xs text-slate-400">
                          <p>{estimate.km} km</p><p className="mt-3">{estimate.minutes} min</p>
                        </div>
                      </div>
                      {selectedExtras.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[#25D36622]">
                          {selectedExtras.map(id => { const e = EXTRAS.find(x => x.id === id)!; return <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-[#25D36622] text-[#128C7E]">{e.icon} {e.label}</span>; })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Elige tu vehículo</p>
                    <div className="flex flex-col gap-1.5 mb-3">
                      {VEHICLES.map(v => {
                        const price = (v.base + v.perKm * estimate.km + extraCost).toFixed(2);
                        return (
                          <button key={v.id} onClick={() => setSelectedVehicle(v.id)} className="flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left" style={{ background: selectedVehicle === v.id ? "#f0fdf4" : "white", border: selectedVehicle === v.id ? "2px solid #25D366" : "2px solid #e2e8f0" }}>
                            <span className="text-xl flex-shrink-0">{v.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{v.label}</p>
                              <p className="text-xs text-slate-400">{v.eta} · {v.seats} asientos</p>
                            </div>
                            <p className="text-base font-bold flex-shrink-0" style={{ color: selectedVehicle === v.id ? "#128C7E" : "#1e293b" }}>${price}</p>
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={handleRequestTrip} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 6px 20px #25D36644" }}>
                      Pedir {vehicle.emoji} {vehicle.label} — ${totalPrice?.toFixed(2)}
                    </button>
                    <p className="text-center text-slate-400 text-xs mt-2">Al continuar aceptas los términos del servicio</p>
                  </>
                )}

                {/* ── STEP: REGISTER ── */}
                {step === "register" && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Casi listo 🎉</h2>
                        <p className="text-xs text-slate-500">Crea tu cuenta para confirmar el viaje</p>
                      </div>
                      <button onClick={() => setStep("estimate")} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
                    </div>
                    <div className="p-3 rounded-xl mb-4 flex items-center gap-3" style={{ background: "#f0fdf4", border: "1px solid #25D36633" }}>
                      <span className="text-xl">{vehicle.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate">{pickup} → {destination}</p>
                        <p className="text-sm font-bold text-[#128C7E]">{vehicle.label} · ${totalPrice?.toFixed(2)}</p>
                      </div>
                    </div>
                    <form onSubmit={handleRegister} className="flex flex-col gap-2.5">
                      <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Tu nombre completo" className="w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition-colors" style={{ borderColor: regName ? "#25D366" : "#e2e8f0" }} />
                      <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition-colors" style={{ borderColor: regPhone ? "#25D366" : "#e2e8f0" }} />
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Contraseña (mín. 6 caracteres)" className="w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none transition-colors pr-11" style={{ borderColor: regPassword ? "#25D366" : "#e2e8f0" }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      </div>
                      {regError && <p className="text-xs text-red-600 px-1">{regError}</p>}
                      <button type="submit" disabled={regLoading} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] transition-all" style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 6px 20px #25D36644" }}>
                        {regLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {regLoading ? "Creando cuenta..." : "Confirmar viaje →"}
                      </button>
                    </form>
                    <p className="text-center text-slate-400 text-xs mt-3">¿Ya tienes cuenta? <a href="/login" className="font-semibold text-[#128C7E]">Inicia sesión</a></p>
                  </>
                )}
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex -space-x-2">
                {["🧑","👩","👨","🧕"].map((e,i) => <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-xs" style={{ background: "oklch(0.20 0.01 250)" }}>{e}</div>)}
              </div>
              <p className="text-white/50 text-sm"><span className="text-white font-semibold">2,400+</span> clientes activos esta semana</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
