import { AlertTriangle, MessageCircle, Phone, Share2, X } from "lucide-react";

type TripActionDockProps = {
  statusLabel: string;
  onChat: () => void;
  onCall: () => void;
  onShare: () => void;
  onSOS: () => void;
  onCancel: () => void;
};

export function TripActionDock({
  statusLabel,
  onChat,
  onCall,
  onShare,
  onSOS,
  onCancel,
}: TripActionDockProps) {
  return (
    <nav
      aria-label="Acciones del viaje"
      className="fixed inset-x-3 bottom-3 z-[990] mx-auto flex max-w-xl items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl shadow-slate-900/20 backdrop-blur md:bottom-4"
    >
      <span className="hidden min-w-0 px-2 text-[10px] font-semibold text-emerald-700 sm:block">
        <i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
        {statusLabel}
      </span>
      <button type="button" onClick={onChat} className="trip-action-dock-button text-emerald-700" aria-label="Abrir chat">
        <MessageCircle size={18} />
        <span>Chat</span>
      </button>
      <button type="button" onClick={onCall} className="trip-action-dock-button text-slate-700" aria-label="Contactar conductor">
        <Phone size={18} />
        <span>Llamar</span>
      </button>
      <button type="button" onClick={onShare} className="trip-action-dock-button text-slate-700" aria-label="Compartir viaje">
        <Share2 size={18} />
        <span>Compartir</span>
      </button>
      <button type="button" onClick={onSOS} className="trip-action-dock-button text-rose-600" aria-label="Enviar alerta SOS">
        <AlertTriangle size={18} />
        <span>SOS</span>
      </button>
      <button type="button" onClick={onCancel} className="trip-action-dock-button text-slate-500" aria-label="Cancelar viaje">
        <X size={18} />
        <span>Cancelar</span>
      </button>
    </nav>
  );
}
