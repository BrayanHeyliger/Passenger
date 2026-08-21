import { useEffect, useRef, useState } from "react";
import {
  CarFront,
  LocateFixed,
  Navigation,
  Radio,
  ShieldCheck,
} from "lucide-react";
import LeafletMap, { type LeafletMapRef } from "@/components/LeafletMap";

export type LiveTripStage = "approaching" | "in_trip" | "completed";

type Props = {
  pickupLabel: string;
  destinationLabel: string;
  driverName: string;
  liveLocation?: unknown;
  useLiveGPS?: boolean;
  onStageChange?: (stage: LiveTripStage) => void;
  onProgressChange?: (progress: number, eta: string, distance: string) => void;
};

export default function LiveTripNavigationMap({
  pickupLabel,
  destinationLabel,
  driverName,
  liveLocation,
  useLiveGPS,
  onStageChange,
  onProgressChange,
}: Props) {
  const mapRef = useRef<LeafletMapRef | null>(null);
  const [stage, setStage] = useState<LiveTripStage>("approaching");
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setPickup(19.427, -99.1677, pickupLabel);
    mapRef.current.setDropoff(19.4363, -99.0719, destinationLabel);
    void mapRef.current.getRoute();
  }, [pickupLabel, destinationLabel]);

  useEffect(() => {
    if (!liveLocation || !mapRef.current || typeof liveLocation !== "object")
      return;
    const location = liveLocation as Record<string, unknown>;
    const coords = location.coords as Record<string, unknown> | undefined;
    const lat = Number(location.lat ?? location.latitude ?? coords?.lat);
    const lng = Number(
      location.lng ?? location.lon ?? location.longitude ?? coords?.lng
    );
    const headingValue = Number(location.heading ?? location.bearing ?? 0);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current.updateVehiclePosition(
        lat,
        lng,
        Number.isFinite(headingValue) ? headingValue : undefined
      );
    }
  }, [liveLocation]);

  useEffect(() => {
    const notify = (next: number, nextStage: LiveTripStage) => {
      const eta =
        nextStage === "approaching"
          ? `${Math.max(1, Math.ceil((52 - next) / 8))} min`
          : nextStage === "in_trip"
            ? `${Math.max(1, Math.ceil((100 - next) / 15))} min`
            : "0 min";
      const distance =
        nextStage === "approaching"
          ? `${Math.max(0.3, Number((2.1 - next / 18).toFixed(1)))} km`
          : nextStage === "in_trip"
            ? `${Math.max(0.1, Number((1.5 - (next - 52) / 30).toFixed(1)))} km`
            : "0 km";
      onStageChange?.(nextStage);
      onProgressChange?.(next, eta, distance);
    };
    notify(progress, stage);
  }, [progress, stage, onStageChange, onProgressChange]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress(value => {
        const next = value >= 96 ? 18 : value + 2;
        setStage(
          next < 52 ? "approaching" : next < 96 ? "in_trip" : "completed"
        );
        return next;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const label =
    stage === "approaching"
      ? "Conductor en camino"
      : stage === "in_trip"
        ? "Navegación activa"
        : "Llegaste a destino";
  const eta =
    stage === "completed"
      ? "0 min"
      : `${Math.max(1, Math.ceil((100 - progress) / 18))} min`;

  return (
    <section className="passenger-trip-map relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/15 bg-[#08141a] shadow-[0_28px_90px_rgba(0,0,0,.3)]">
      <LeafletMap
        className="absolute inset-0 h-full w-full"
        height="100%"
        showNearbyVehicles={false}
        onMapReady={ref => {
          mapRef.current = ref;
          ref.setPickup(19.427, -99.1677, pickupLabel);
          ref.setDropoff(19.4363, -99.0719, destinationLabel);
          void ref.getRoute();
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_54%_50%,transparent_24%,rgba(2,8,13,.28)_88%)]" />
      <div className="pointer-events-none absolute inset-x-5 top-5 z-[500] flex items-start justify-between gap-3 sm:inset-x-8 sm:top-7">
        <div className="passenger-map-route-card w-[8.5rem] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-white/55">
            Llegada en
          </p>
          <p className="mt-1 text-[1.75rem] font-bold leading-none text-[#55e89a]">
            {eta}
          </p>
          <p className="mt-1 text-[11px] text-white/45">
            ({Math.max(0.3, ((100 - progress) / 48).toFixed(1))} km)
          </p>
        </div>
        <div className="passenger-map-destination-card hidden max-w-[13rem] px-4 py-3 sm:block">
          <p className="text-xs font-semibold text-[#ff817a]">Destino</p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            {destinationLabel}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute left-[9%] top-[40%] z-[500] hidden sm:block">
        <div className="passenger-map-pickup-card max-w-[12rem] px-4 py-3">
          <p className="text-xs font-semibold text-[#55e89a]">
            Punto de recogida
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            {pickupLabel}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="Centrar mapa"
        onClick={() => mapRef.current?.panTo(19.427, -99.1677)}
        className="pointer-events-auto absolute bottom-5 right-5 z-[500] grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-[#071016]/85 text-white/80 shadow-xl backdrop-blur transition hover:border-[#55e89a]/60 hover:text-[#55e89a]"
      >
        <LocateFixed size={18} />
      </button>

      <div className="pointer-events-none absolute inset-x-5 bottom-5 z-[500] flex max-w-[24rem] items-center gap-3 rounded-2xl border border-white/15 bg-[#071016]/90 px-4 py-3 shadow-xl backdrop-blur sm:inset-x-8">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/15 text-[#55e89a]">
          <CarFront size={19} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {driverName} · {label}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            <Navigation size={12} className="mr-1 inline text-[#55e89a]" />
            Seguimiento GPS en tiempo real
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-5 bottom-[-4.3rem] z-[500] hidden h-16 items-center justify-between rounded-2xl border border-white/15 bg-[#071016]/90 px-6 shadow-xl backdrop-blur sm:inset-x-8 sm:flex">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#55e89a]" size={27} />
          <div>
            <p className="text-sm font-semibold text-white">
              Conductor en camino
            </p>
            <p className="text-xs text-white/45">Todo va según lo planeado.</p>
          </div>
        </div>
        <div className="h-9 w-px bg-white/15" />
        <div className="flex items-center gap-3">
          <Radio className="text-[#55e89a]" size={28} />
          <div>
            <p className="text-sm font-semibold text-white">
              Seguimiento en vivo
            </p>
            <p className="text-xs text-white/45">
              Actualización cada 5 segundos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
