import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ShieldAlert,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { TripChat } from "@/components/TripChat";
import { useSocket } from "@/hooks/useSocket";
import { ControlledStreetMap } from "./FunctionalReferenceTripTrackingPage";
import "./trip-flow-responsive.css";

type StoredTrip = {
  id?: string;
  pickup?: string;
  destination?: string;
  estimatedEta?: string;
  eta?: string;
  estimatedPrice?: string | number;
  fare?: string | number;
  status?: string;
  vehicleType?: string;
};

type DriverSummary = {
  name: string;
  rating: number;
  vehicle: string;
  eta: number;
  price: number;
  initials: string;
  phone?: string;
};

function parseStoredJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function getActiveTrip(): StoredTrip {
  const requestedId = new URLSearchParams(window.location.search).get("tripId");
  const trips = parseStoredJson<StoredTrip[]>("wt_pending_trips") || [];
  const storedTrip = requestedId
    ? trips.find(trip => trip.id === requestedId)
    : trips.find(trip => ["requested", "accepted", "in_progress"].includes(trip.status || ""));
  return (
    storedTrip ||
    parseStoredJson<StoredTrip>("unpasajeroActiveTrip") ||
    parseStoredJson<StoredTrip>("pendingTrip") || {
      id: requestedId || "gps-demo",
      pickup: "Lake Eola Park, Orlando, FL",
      destination: "Orlando International Airport (MCO)",
      estimatedEta: "4 min",
      estimatedPrice: 115,
    }
  );
}

function getDriver(): DriverSummary {
  return (
    parseStoredJson<DriverSummary>("selectedDriver") || {
      name: "Miguel Ángel Ramírez",
      rating: 4.9,
      vehicle: "Toyota Prius 2021",
      eta: 4,
      price: 115,
      initials: "MR",
      phone: "+14075550108",
    }
  );
}

export default function PassengerTripTrackingPage() {
  const [, navigate] = useLocation();
  const [shared, setShared] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const trip = getActiveTrip();
  const driver = getDriver();
  const tripId = String(trip.id || "gps-demo");
  const trackingRoomId = tripId.startsWith("trip-") ? tripId : `trip-${tripId}`;
  const pickup = trip.pickup || "Lake Eola Park, Orlando, FL";
  const destination = trip.destination || "Orlando International Airport (MCO)";
  const eta = trip.estimatedEta || trip.eta || `${driver.eta || 4} min`;
  const rawPrice = trip.estimatedPrice ?? trip.fare ?? driver.price;
  const price = String(rawPrice).replace(/[^0-9.]/g, "") || String(driver.price);
  const { driverLocation, isConnected: gpsConnected } = useSocket({
    roomId: trackingRoomId,
    userId: "client-tracking",
    role: "client",
  });

  return (
    <main className="min-h-screen bg-[#071016] text-white">
      <header className="border-b border-white/10 bg-[#071016]/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-left"
            aria-label="Volver al inicio"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400 font-extrabold text-[#071016]">P</span>
            <span>
              <b className="block text-sm">UnPasajero.Com</b>
              <small className="block text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">Orlando Mobility</small>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-emerald-300 sm:inline">
              <i className={`mr-2 inline-block h-2 w-2 rounded-full ${gpsConnected ? "animate-pulse bg-emerald-400" : "bg-amber-300"}`} />
              {gpsConnected ? "Seguimiento GPS" : "Conectando GPS"}
            </span>
            <button
              type="button"
              onClick={() => navigate("/client-dashboard")}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/75 transition hover:border-emerald-300/50 sm:text-sm"
            >
              Mis viajes
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 max-w-2xl">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-400">Seguimiento en vivo</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Tu conductor está <span className="text-emerald-400">en camino.</span>
          </h1>
          <p className="mt-2 text-sm text-white/55">Llegada estimada en {eta} · Ruta activa · Precio estimado ${price}</p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1.18fr_.82fr]">
          <section className="space-y-3">
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b171d] shadow-2xl shadow-black/30">
              <ControlledStreetMap
                onPickup={() => toast.info(`Recogida: ${pickup}`)}
                onDestination={() => toast.info(`Destino: ${destination}`)}
                driverLocation={driverLocation}
                pickup={pickup}
                destination={destination}
                eta={eta}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/65">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-emerald-300" /> Seguimiento GPS activo</span>
              <span>{gpsConnected ? "Ubicación actualizada" : "Ruta por calles"}</span>
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-3xl border border-emerald-400/35 bg-emerald-400/[0.08] p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-700 text-sm font-bold text-[#071016]">{driver.initials}</div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold">{driver.name}</h2>
                  <p className="text-xs text-emerald-300"><Star size={12} className="mr-1 inline fill-current" />{driver.rating} · Conductor verificado</p>
                  <p className="mt-1 text-[11px] text-white/50">{driver.vehicle}</p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-white/65">Llega en</span>
                <span className="text-2xl font-bold text-emerald-300">{eta}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[42%] rounded-full bg-emerald-400 transition-[width] duration-700" /></div>
              <p className="mt-2 text-[11px] text-white/45">El conductor se dirige a tu punto de recogida.</p>
            </section>

            <section className="rounded-3xl border border-white/12 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Tu viaje</h2><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] text-emerald-300">En curso</span></div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><CheckCircle2 className="shrink-0 text-emerald-400" size={17} /><div><p className="text-white/80">Solicitud confirmada</p><p className="text-[11px] text-white/40">Conductor asignado</p></div></div>
                <div className="flex gap-3"><Clock3 className="shrink-0 text-emerald-400" size={17} /><div><p className="text-white/80">Conductor en camino</p><p className="text-[11px] text-white/40">Ruta y posición actualizadas</p></div></div>
                <div className="flex gap-3 opacity-45"><MapPin className="shrink-0" size={17} /><div><p>En destino</p><p className="text-[11px]">Pendiente</p></div></div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setShared(true); toast.success("Enlace de viaje compartido"); }} className="rounded-xl border border-white/15 px-3 py-2.5 text-xs text-white/75 transition hover:border-emerald-400/60"><Share2 size={15} className="mr-1.5 inline" />{shared ? "Compartido" : "Compartir"}</button>
              <button type="button" onClick={() => setSafetyOpen(true)} className="rounded-xl border border-rose-400/40 px-3 py-2.5 text-xs text-rose-300 transition hover:bg-rose-400/10"><ShieldAlert size={15} className="mr-1.5 inline" />Seguridad</button>
              <button type="button" onClick={() => setChatOpen(true)} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs text-white/75 transition hover:bg-white/[0.1]"><MessageCircle size={15} className="mr-1.5 inline text-emerald-300" />Chat</button>
              <button type="button" onClick={() => driver.phone ? (window.location.href = `tel:${driver.phone}`) : toast.info("La llamada se gestiona desde el chat seguro")} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs text-white/75 transition hover:bg-white/[0.1]"><Phone size={15} className="mr-1.5 inline text-emerald-300" />Llamar</button>
            </div>
          </aside>
        </div>
      </section>

      {safetyOpen && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/70 p-5">
          <div className="w-full max-w-sm rounded-3xl border border-rose-400/40 bg-[#101c29] p-5">
            <div className="flex items-center gap-3"><ShieldAlert className="text-rose-300" /><h2 className="text-lg font-bold">Centro de seguridad</h2></div>
            <p className="mt-3 text-sm text-white/60">Comparte tu viaje con una persona de confianza o solicita asistencia inmediata.</p>
            <div className="mt-5 grid gap-2"><button type="button" onClick={() => { toast.success("Solicitud de asistencia enviada"); setSafetyOpen(false); }} className="rounded-xl bg-rose-400 py-3 text-sm font-semibold text-[#071016]"><Bell size={15} className="mr-2 inline" />Solicitar asistencia</button><button type="button" onClick={() => setSafetyOpen(false)} className="rounded-xl border border-white/15 py-3 text-sm text-white/70">Cerrar</button></div>
          </div>
        </div>
      )}

      <TripChat tripId={trackingRoomId} userId="client-tracking" userName="Cliente" role="client" otherPartyName={driver.name} forceOpen={chatOpen} onOpenChange={setChatOpen} />
    </main>
  );
}
