import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Zap,
} from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

type DriverCandidate = {
  id: string;
  name: string;
  vehicle: string;
  rating: number;
  distanceMiles: number;
  eta: string;
  profilePhotoUrl: string;
  paymentMethods: string[];
  verified: boolean;
};

type StoredTrip = {
  id: string;
  pickup: string;
  destination: string;
  serviceLabel: string;
  estimatedPrice: number;
  estimatedEta: string;
  status: "choosing_driver" | "awaiting_driver" | "driver_declined" | "searching" | "assigned";
  selectedDriverId?: string;
  assignmentMode?: "manual" | "auto";
  driver?: DriverCandidate;
};

const TRIPS_KEY = "wt_pending_trips";
const driverCandidates: DriverCandidate[] = [
  { id: "driver-demo", name: "Demo Driver", vehicle: "Toyota Corolla", rating: 4.9, distanceMiles: 0.8, eta: "3 min", profilePhotoUrl: "/manus-storage/demo-driver-profile_5f16f288.jpg", verified: true, paymentMethods: ["Efectivo", "Zelle", "Cash App"] },
  { id: "driver-luis", name: "Luis R.", vehicle: "Honda Civic", rating: 4.8, distanceMiles: 1.4, eta: "5 min", profilePhotoUrl: "/manus-storage/luis-driver-profile_c6f23eac.jpg", verified: true, paymentMethods: ["Efectivo", "Zelle", "Transferencia"] },
  { id: "driver-ana", name: "Ana G.", vehicle: "Nissan Versa", rating: 4.7, distanceMiles: 2.1, eta: "7 min", profilePhotoUrl: "/manus-storage/ana-driver-profile_12c06a6f.jpg", verified: true, paymentMethods: ["Efectivo", "Cash App", "PayPal"] },
];

function getStoredTrip(): StoredTrip | null {
  try {
    const raw = localStorage.getItem("unpasajeroActiveTrip");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTrip(trip: StoredTrip) {
  localStorage.setItem("unpasajeroActiveTrip", JSON.stringify(trip));
  sessionStorage.setItem("pendingTrip", JSON.stringify(trip));
}

export default function TripRequestPage() {
  const [, navigate] = useLocation();
  const { config } = useSiteConfig();
  const [trip, setTrip] = useState<StoredTrip | null>(() => {
    const stored = getStoredTrip();
    return stored && stored.status === "searching" && !stored.selectedDriverId
      ? { ...stored, status: "choosing_driver" }
      : stored;
  });
  const [selectionIssue, setSelectionIssue] = useState<"no_response" | "declined" | null>(null);

  const availableDrivers = useMemo(() => {
    const radius = Math.max(1, Number(config.driverSearchRadiusMiles || 12));
    const minRating = Math.max(0, Number(config.minimumDriverRating || 0));
    const enabledPayments = new Set([
      config.directPaymentCashEnabled && "Efectivo",
      config.directPaymentZelleEnabled && "Zelle",
      config.directPaymentCashAppEnabled && "Cash App",
      config.directPaymentPaypalEnabled && "PayPal",
      config.directPaymentTransferEnabled && "Transferencia",
    ].filter(Boolean));
    if (!config.directPaymentEnabled) return [];
    return driverCandidates
      .filter(driver => driver.distanceMiles <= radius && driver.rating >= minRating && (!config.verifiedDriversOnly || driver.verified))
      .map(driver => ({ ...driver, paymentMethods: driver.paymentMethods.filter(method => enabledPayments.has(method)) }))
      .filter(driver => driver.paymentMethods.length > 0);
  }, [config]);

  useEffect(() => {
    if (trip?.status === "choosing_driver") saveTrip(trip);
  }, [trip]);

  useEffect(() => {
    if (trip?.status !== "awaiting_driver") return;
    const timeout = window.setTimeout(() => setSelectionIssue("no_response"), Math.max(5, Number(config.driverResponseTimeoutSeconds || 10)) * 1000);
    return () => window.clearTimeout(timeout);
  }, [trip?.status, trip?.id, config.driverResponseTimeoutSeconds]);

  useEffect(() => {
    if (!trip?.id || trip.status === "assigned") return;
    const interval = window.setInterval(() => {
      try {
        const pendingTrips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
        const persisted = pendingTrips.find((item: any) => item.id === trip.id);
        if (persisted?.status === "accepted") {
          const accepted = { ...trip, status: "assigned" as const, driver: persisted.driver || trip.driver };
          saveTrip(accepted);
          setTrip(accepted);
          setSelectionIssue(null);
        }
        if (persisted?.status === "driver_declined") {
          const declined = { ...trip, status: "driver_declined" as const };
          saveTrip(declined);
          setTrip(declined);
          setSelectionIssue("declined");
        }
      } catch {}
    }, 1200);
    return () => window.clearInterval(interval);
  }, [trip]);

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#071016] px-6 py-12 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8 text-center">
          <h1 className="text-2xl font-bold">No encontramos una solicitud activa</h1>
          <p className="mt-3 text-sm text-white/60">Vuelve a la portada para crear un viaje.</p>
          <button className="mt-6 rounded-xl bg-emerald-300 px-5 py-3 font-bold text-[#062018]" onClick={() => navigate("/")}>Volver a pedir un ride</button>
        </div>
      </main>
    );
  }

  const selectDriver = (driver: DriverCandidate, assignmentMode: "manual" | "auto") => {
    const next: StoredTrip = { ...trip, status: "awaiting_driver", selectedDriverId: driver.id, assignmentMode, driver };
    saveTrip(next);
    const pendingTrips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    const pendingTrip = {
      id: next.id,
      clientId: "guest",
      clientName: "Pasajero UnPasajero.Com",
      pickup: next.pickup,
      dropoff: next.destination,
      fare: `$${next.estimatedPrice.toFixed(2)}`,
      status: "requested",
      requestedAt: new Date().toISOString(),
      selectedDriverId: driver.id,
      assignmentMode,
      driver: { ...driver, paymentModel: "direct_to_driver" },
    };
    localStorage.setItem(TRIPS_KEY, JSON.stringify([...pendingTrips.filter((item: any) => item.id !== next.id), pendingTrip]));
    setTrip(next);
    setSelectionIssue(null);
  };

  const startAutoSearch = () => {
    const candidate = availableDrivers.find(driver => driver.id !== trip.selectedDriverId);
    if (candidate) selectDriver(candidate, "auto");
  };

  const assigned = trip.status === "assigned";
  const selecting = trip.status === "choosing_driver";
  const tripDetails = (
    <div className="mt-6 space-y-3">
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm"><span className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-emerald-300" size={17} /><b>{trip.pickup}</b></span><span className="flex gap-3"><Navigation className="mt-0.5 shrink-0 text-rose-300" size={17} /><b>{trip.destination}</b></span></div>
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4"><small className="block text-[10px] font-extrabold tracking-[.15em] text-emerald-200">RIDE SELECCIONADO</small><b className="mt-1 block text-lg">{trip.serviceLabel}</b><em className="mt-1 block text-xs not-italic text-white/60"><Clock3 className="mr-1 inline" size={13} />Llegada estimada: {trip.estimatedEta}</em></div>
    </div>
  );
  return (
    <main className="min-h-screen bg-[#071016] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-xl">
        <button onClick={() => navigate("/")} className="text-sm font-semibold text-emerald-200">← Volver a la portada</button>
        <section className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,#153137,#09161b)] p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[.16em] text-emerald-300">SOLICITUD DE VIAJE</p>
              <h1 className="mt-3 text-3xl font-extrabold">{assigned ? "Conductor confirmado" : selecting ? "Elige a tu conductor" : "Solicitud en espera"}</h1>
              {!assigned && <p className="mt-2 text-sm text-white/60">El pasajero paga directamente al conductor. UnPasajero.Com no procesa el pago del viaje.</p>}
            </div>
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${assigned ? "bg-emerald-300 text-[#062018]" : "bg-emerald-300/15 text-emerald-200"}`}>{assigned ? <CheckCircle2 size={24} /> : <Search size={23} className={selecting ? "" : "animate-pulse"} />}</span>
          </div>
          {selecting && <div className="mt-7 space-y-3"><div><p className="font-bold">Conductores disponibles cerca de ti</p><p className="mt-1 text-sm text-white/55">Elige el conductor que prefieras antes de revisar los detalles del viaje.</p></div>{availableDrivers.map(driver => <button key={driver.id} onClick={() => selectDriver(driver, "manual")} className="w-full rounded-2xl border border-white/10 bg-white/[.055] p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-300/10"><div className="flex items-center gap-3"><img src={driver.profilePhotoUrl} alt={`Foto demostrativa de ${driver.name}`} className="h-14 w-14 shrink-0 rounded-2xl border border-white/15 object-cover" /><span className="min-w-0 flex-1"><b className="block">{driver.name} <em className="ml-1 text-xs not-italic text-emerald-300">Verificado</em></b><small className="mt-1 block text-white/55">{driver.vehicle} · ★ {driver.rating.toFixed(1)} · {driver.distanceMiles.toFixed(1)} mi · {driver.eta}</small><small className="mt-1 block text-[10px] text-white/35">Foto de perfil demostrativa</small></span><ChevronRight className="shrink-0 text-emerald-200" size={19} /></div><span className="mt-3 flex flex-wrap gap-1.5">{driver.paymentMethods.map(method => <small key={method} className="rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[11px] text-white/75">{method}</small>)}</span></button>)}{availableDrivers.length === 0 && <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">No hay conductores cercanos según las reglas actuales de operación. Ajusta radio, rating o métodos habilitados.</div>}</div>}

          {!selecting && !assigned && trip.driver && <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs font-extrabold tracking-[.14em] text-emerald-300">{trip.assignmentMode === "auto" ? "AUTOBÚSQUEDA ACTIVA" : "CONDUCTOR ELEGIDO"}</p><div className="mt-3 flex items-center gap-3"><img src={trip.driver.profilePhotoUrl} alt={`Foto demostrativa de ${trip.driver.name}`} className="h-14 w-14 rounded-2xl border border-white/15 object-cover" /><span><b className="block">{trip.driver.name}</b><small className="text-white/55">{trip.driver.vehicle} · ★ {trip.driver.rating.toFixed(1)} · {trip.driver.distanceMiles.toFixed(1)} mi</small></span></div><div className="mt-3 flex flex-wrap gap-1.5">{trip.driver.paymentMethods.map(method => <small key={method} className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/75">{method}</small>)}</div></div>}

          {!assigned && !selecting && <div className="mt-5"><p className="flex items-center gap-2 text-sm text-white/60"><Search size={16} className="animate-pulse text-emerald-300" />Esperando la respuesta del conductor elegido.</p>{selectionIssue && config.autoSearchEnabled && <button onClick={startAutoSearch} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-extrabold text-[#062018]"><Zap size={18} fill="currentColor" /> Autobúsqueda</button>}</div>}

          {assigned && <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="flex items-center gap-3">{trip.driver?.profilePhotoUrl ? <img src={trip.driver.profilePhotoUrl} alt={`Foto demostrativa de ${trip.driver.name}`} className="h-14 w-14 rounded-2xl border border-white/15 object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200"><UserRoundCheck size={21} /></span>}<span><b className="block">{trip.driver?.name || "Conductor confirmado"}</b><small className="text-white/55">{trip.driver?.vehicle || "Vehículo asignado"} · llega en {trip.estimatedEta}</small></span></div></div>}
          {tripDetails}
          <button disabled={!assigned} onClick={() => navigate(`/trip-tracking?tripId=${trip.id}`)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 font-extrabold text-[#062018] transition enabled:hover:brightness-105 disabled:cursor-wait disabled:opacity-55">{assigned ? <><CarFront size={18} /> Ver viaje en curso <ArrowRight size={17} /></> : "Esperando respuesta del conductor"}</button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/48"><ShieldCheck size={14} className="text-emerald-300" />Solicitud guardada en este dispositivo. El pago se coordina directamente con el conductor.</p>
        </section>
      </div>
    </main>
  );
}
