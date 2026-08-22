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
import { TripChat } from "@/components/TripChat";
import LiveTripNavigationMap, {
  type LiveTripStage,
} from "@/components/LiveTripNavigationMap";
import { useSocket } from "@/hooks/useSocket";
import { useLocation } from "wouter";

export default function PassengerTripTrackingPage() {
  const [, navigate] = useLocation();
  const [shared, setShared] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [tripStage, setTripStage] = useState<LiveTripStage>("approaching");
  const [progress, setProgress] = useState(18);
  const [eta, setEta] = useState("4 min");
  const [distance, setDistance] = useState("1.8 km");
  const driver = JSON.parse(
    sessionStorage.getItem("selectedDriver") ||
      '{"name":"Miguel Ángel Ramírez","rating":4.9,"vehicle":"Toyota Prius 2021","eta":4,"price":115,"initials":"MR"}'
  );
  const trip = JSON.parse(
    sessionStorage.getItem("pendingTrip") ||
      '{"pickup":"Lake Eola Park, Orlando, FL","destination":"Orlando International Airport (MCO)"}'
  );
  const tripId = String(
    trip.id || sessionStorage.getItem("activeTripId") || "gps-demo"
  );
  const trackingRoomId = `trip-${tripId}`;
  const { driverLocation, isConnected: gpsConnected } = useSocket({
    roomId: trackingRoomId,
    userId: "client-tracking",
    role: "client",
  });
  const liveLabel =
    tripStage === "approaching"
      ? "Tu conductor está en camino."
      : tripStage === "in_trip"
        ? "Tu viaje está en curso."
        : "Llegaste a tu destino.";

  return (
    <main className="min-h-screen bg-[#071016] text-white">
      <header className="border-b border-white/10 bg-[#071016]/95 px-5 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <a href="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/saytaxi-brand.svg"
              alt="SayTaxi"
              className="h-11 w-auto max-w-[190px]"
            />
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-emerald-300 sm:inline">
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${gpsConnected ? "animate-pulse bg-emerald-400" : "bg-amber-300"}`}
              />
              {gpsConnected ? "Seguimiento GPS conectado" : "Conectando GPS"}
            </span>
            <button
              onClick={() => navigate("/client-dashboard")}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white/75 transition hover:border-emerald-300/50 sm:px-4"
            >
              Mis viajes
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7 max-w-2xl">
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-400">
            Seguimiento en vivo
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            {liveLabel.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-emerald-400">
              {liveLabel.split(" ").slice(-2).join(" ")}
            </span>
          </h1>
          <p className="mt-3 text-white/55">
            Llegada estimada en {eta} · {distance} restantes · Precio estimado $
            {driver.price}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <LiveTripNavigationMap
            pickupLabel={trip.pickup}
            destinationLabel={trip.destination}
            driverName={driver.name}
            liveLocation={driverLocation}
            useLiveGPS={true}
            onStageChange={setTripStage}
            onProgressChange={(nextProgress, nextEta, nextDistance) => {
              setProgress(nextProgress);
              setEta(nextEta);
              setDistance(nextDistance);
            }}
          />
          <section className="space-y-4">
            <div className="rounded-3xl border border-emerald-400/35 bg-emerald-400/[0.08] p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-700 font-bold text-[#071016]">
                  {driver.initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{driver.name}</h2>
                  <p className="text-sm text-emerald-300">
                    <Star size={13} className="mr-1 inline fill-current" />
                    {driver.rating} · Conductor verificado
                  </p>
                  <p className="mt-1 text-xs text-white/50">{driver.vehicle}</p>
                </div>
              </div>
              <div className="mb-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-white/65">
                  {tripStage === "completed" ? "Estado" : "Llega en"}
                </span>
                <span className="text-2xl font-bold text-emerald-300">
                  {tripStage === "completed" ? "Completado" : eta}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-[width] duration-700"
                  style={{ width: `${Math.max(8, progress)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/45">
                {tripStage === "approaching"
                  ? "El conductor se dirige a tu punto de recogida."
                  : tripStage === "in_trip"
                    ? "El conductor sigue la ruta por calles hacia el destino."
                    : "El recorrido finalizó correctamente."}
              </p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/[0.035] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Tu viaje</h2>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                  {tripStage === "completed" ? "Finalizado" : "En curso"}
                </span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  <div>
                    <p className="text-white/80">Solicitud confirmada</p>
                    <p className="text-xs text-white/40">Conductor asignado</p>
                  </div>
                </div>
                <div
                  className={`flex gap-3 ${tripStage === "approaching" ? "" : "opacity-100"}`}
                >
                  <Clock3 className="text-emerald-400" size={18} />
                  <div>
                    <p className="text-white/80">
                      {tripStage === "approaching"
                        ? "Conductor en camino"
                        : "Navegación activa"}
                    </p>
                    <p className="text-xs text-white/40">
                      Ruta y posición actualizadas
                    </p>
                  </div>
                </div>
                <div
                  className={`flex gap-3 ${tripStage === "completed" ? "" : "opacity-45"}`}
                >
                  <MapPin
                    className={
                      tripStage === "completed" ? "text-emerald-400" : ""
                    }
                    size={18}
                  />
                  <div>
                    <p>En destino</p>
                    <p className="text-xs">
                      {tripStage === "completed"
                        ? "Recorrido completado"
                        : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShared(true);
                  toast.success("Enlace de viaje compartido");
                }}
                className="rounded-xl border border-white/15 px-3 py-3 text-sm text-white/75 transition hover:border-emerald-400/60 hover:text-emerald-300"
              >
                <Share2 size={16} className="mr-2 inline" />
                {shared ? "Compartido" : "Compartir"}
              </button>
              <button
                onClick={() => setSafetyOpen(true)}
                className="rounded-xl border border-rose-400/40 px-3 py-3 text-sm text-rose-300 transition hover:bg-rose-400/10"
              >
                <ShieldAlert size={16} className="mr-2 inline" />
                Seguridad
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setChatOpen(true)}
                className="rounded-xl bg-white/[0.06] px-3 py-3 text-sm text-white/70 transition hover:bg-white/[0.1]"
              >
                <MessageCircle
                  size={16}
                  className="mr-2 inline text-emerald-300"
                />
                Chat
              </button>
              <button
                onClick={() => {
                  if (driver.phone)
                    window.location.href = `tel:${driver.phone}`;
                  else
                    toast.info("La llamada se gestiona desde el chat seguro");
                }}
                className="rounded-xl bg-white/[0.06] px-3 py-3 text-sm text-white/70 transition hover:bg-white/[0.1]"
              >
                <Phone size={16} className="mr-2 inline text-emerald-300" />
                Llamar
              </button>
            </div>
          </section>
        </div>
      </div>
      {safetyOpen && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-3xl border border-rose-400/40 bg-[#101c29] p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-300" />
              <h2 className="text-xl font-bold">Centro de seguridad</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Comparte tu viaje con un contacto de confianza o solicita
              asistencia inmediata.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => {
                  toast.success("Solicitud de asistencia enviada");
                  setSafetyOpen(false);
                }}
                className="rounded-xl bg-rose-400 py-3 font-semibold text-[#071016]"
              >
                <Bell size={16} className="mr-2 inline" />
                Solicitar asistencia
              </button>
              <button
                onClick={() => setSafetyOpen(false)}
                className="rounded-xl border border-white/15 py-3 text-white/70"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      <TripChat
        tripId={trackingRoomId}
        userId="client-tracking"
        userName="Cliente"
        role="client"
        otherPartyName={driver.name}
        forceOpen={chatOpen}
        onOpenChange={setChatOpen}
      />
    </main>
  );
}
