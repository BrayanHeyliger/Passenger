import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

type StoredTrip = {
  id: string;
  pickup: string;
  destination: string;
  serviceLabel: string;
  estimatedPrice: number;
  estimatedEta: string;
  status: "searching" | "assigned";
};

function getStoredTrip(): StoredTrip | null {
  try {
    const raw = localStorage.getItem("unpasajeroActiveTrip");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function TripRequestPage() {
  const [, navigate] = useLocation();
  const [trip, setTrip] = useState<StoredTrip | null>(() => getStoredTrip());

  useEffect(() => {
    if (!trip || trip.status === "assigned") return;
    const timer = window.setTimeout(() => {
      const assigned = { ...trip, status: "assigned" as const };
      localStorage.setItem("unpasajeroActiveTrip", JSON.stringify(assigned));
      sessionStorage.setItem("pendingTrip", JSON.stringify(assigned));
      setTrip(assigned);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [trip]);

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#071016] px-6 py-12 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8 text-center">
          <h1 className="text-2xl font-bold">
            No encontramos una solicitud activa
          </h1>
          <p className="mt-3 text-sm text-white/60">
            Vuelve a la portada para crear un viaje.
          </p>
          <button
            className="mt-6 rounded-xl bg-emerald-300 px-5 py-3 font-bold text-[#062018]"
            onClick={() => navigate("/")}
          >
            Volver a pedir un ride
          </button>
        </div>
      </main>
    );
  }

  const assigned = trip.status === "assigned";
  return (
    <main className="min-h-screen bg-[#071016] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-xl">
        <button
          onClick={() => navigate("/")}
          className="text-sm font-semibold text-emerald-200"
        >
          ← Volver a la portada
        </button>
        <section className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,#153137,#09161b)] p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold tracking-[.16em] text-emerald-300">
                SOLICITUD DE VIAJE
              </p>
              <h1 className="mt-3 text-3xl font-extrabold">
                {assigned ? "Conductor asignado" : "Buscando un conductor"}
              </h1>
            </div>
            <span
              className={`grid h-12 w-12 place-items-center rounded-2xl ${assigned ? "bg-emerald-300 text-[#062018]" : "bg-emerald-300/15 text-emerald-200"}`}
            >
              {assigned ? (
                <CheckCircle2 size={24} />
              ) : (
                <Search size={23} className="animate-pulse" />
              )}
            </span>
          </div>
          <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm">
            <span className="flex gap-3">
              <MapPin className="mt-0.5 shrink-0 text-emerald-300" size={17} />
              <b>{trip.pickup}</b>
            </span>
            <span className="flex gap-3">
              <Navigation className="mt-0.5 shrink-0 text-rose-300" size={17} />
              <b>{trip.destination}</b>
            </span>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <span>
              <small className="block text-[10px] font-extrabold tracking-[.15em] text-emerald-200">
                RIDE SELECCIONADO
              </small>
              <b className="mt-1 block text-lg">{trip.serviceLabel}</b>
              <em className="mt-1 block text-xs not-italic text-white/60">
                <Clock3 className="mr-1 inline" size={13} />
                Llegada estimada: {trip.estimatedEta}
              </em>
            </span>
            <strong className="text-xl text-emerald-200">
              ${trip.estimatedPrice}
            </strong>
          </div>
          {assigned ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-300/15 text-emerald-200">
                  <UserRoundCheck size={21} />
                </span>
                <span>
                  <b className="block">Mateo Rivera</b>
                  <small className="text-white/55">
                    Toyota Corolla · 4.9 ★ · llega en {trip.estimatedEta}
                  </small>
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-5 flex items-center gap-2 text-sm text-white/60">
              <Search size={16} className="animate-pulse text-emerald-300" />{" "}
              Estamos buscando al conductor disponible más cercano.
            </p>
          )}
          <button
            disabled={!assigned}
            onClick={() => navigate(`/trip-tracking?tripId=${trip.id}`)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 font-extrabold text-[#062018] transition enabled:hover:brightness-105 disabled:cursor-wait disabled:opacity-55"
          >
            {assigned ? (
              <>
                <CarFront size={18} /> Ver viaje en curso{" "}
                <ArrowRight size={17} />
              </>
            ) : (
              "Asignando conductor..."
            )}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/48">
            <ShieldCheck size={14} className="text-emerald-300" /> Solicitud
            guardada de forma segura en este dispositivo.
          </p>
        </section>
      </div>
    </main>
  );
}
