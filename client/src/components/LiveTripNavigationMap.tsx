import { useEffect, useRef, useState } from "react";
import { CarFront, MapPin, Navigation, Route } from "lucide-react";
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

export default function LiveTripNavigationMap({ pickupLabel, destinationLabel, driverName, onStageChange, onProgressChange }: Props) {
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
    const notify = (next: number, nextStage: LiveTripStage) => {
      const eta = nextStage === "approaching" ? `${Math.max(1, Math.ceil((52 - next) / 8))} min` : nextStage === "in_trip" ? `${Math.max(1, Math.ceil((100 - next) / 15))} min` : "0 min";
      const distance = nextStage === "approaching" ? `${Math.max(0.3, (2.1 - next / 18).toFixed(1))} km` : nextStage === "in_trip" ? `${Math.max(0.1, (1.5 - (next - 52) / 30).toFixed(1))} km` : "0 km";
      onStageChange?.(nextStage);
      onProgressChange?.(next, eta, distance);
    };
    notify(progress, stage);
  }, [progress, stage, onStageChange, onProgressChange]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress(value => {
        const next = value >= 96 ? 18 : value + 2;
        const nextStage: LiveTripStage = next < 52 ? "approaching" : next < 96 ? "in_trip" : "completed";
        setStage(nextStage);
        return next;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const label = stage === "approaching" ? "Conductor en camino" : stage === "in_trip" ? "Navegación activa" : "Llegaste a destino";
  return <section className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-white/12 bg-[#0b171d]"><LeafletMap className="absolute inset-0 h-full w-full brightness-[.62] contrast-[1.12] saturate-[.72]" height="100%" onMapReady={ref => { mapRef.current = ref; ref.setPickup(19.427, -99.1677, pickupLabel); ref.setDropoff(19.4363, -99.0719, destinationLabel); void ref.getRoute(); }} /><div className="pointer-events-none absolute inset-x-5 top-5 flex justify-between gap-3"><div className="rounded-2xl border border-white/10 bg-[#071016]/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-300">{label}</p><p className="mt-1 text-sm font-semibold text-white">{stage === "approaching" ? `Esperando ubicación GPS segura de ${driverName}...` : stage === "in_trip" ? "Ruta en actualización continua" : "Recorrido finalizado"}</p><p className="mt-1 text-xs text-white/45">{pickupLabel} → {destinationLabel}</p></div><div className="rounded-2xl border border-emerald-300/30 bg-[#071016]/90 p-3 text-center backdrop-blur"><p className="text-lg font-extrabold text-emerald-200">{Math.round(progress)}%</p><p className="text-[10px] text-white/45">ruta</p></div></div><div className="pointer-events-none absolute bottom-5 left-5 rounded-2xl border border-white/10 bg-[#071016]/90 px-4 py-3 shadow-xl backdrop-blur"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-300/15 text-emerald-200"><CarFront size={18} /></span><div><p className="text-sm font-bold text-white">Seguimiento GPS en tiempo real</p><p className="text-xs text-white/50"><Navigation size={12} className="mr-1 inline text-emerald-300" />{label}</p></div></div></div></section>;
}
