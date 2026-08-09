import { useState } from "react";
import { X } from "lucide-react";

export function ParcelPromoBar() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("parcelPromo_dismissed") === "true";
    }
    return false;
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("parcelPromo_dismissed", "true");
  };

  return (
    <div className="relative w-full h-auto bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left: Promo Image */}
          <div className="flex justify-center lg:justify-start">
            <img
              src="/manus-storage/parcel_promo_banner_0ebebc94.png"
              alt="Nuevo servicio de paquetería"
              className="w-full max-w-md h-auto rounded-xl shadow-lg"
            />
          </div>

          {/* Right: Text Content */}
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex lg:inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-2xl">📦</span>
              <span className="text-sm font-semibold text-green-600">NUEVO SERVICIO</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Envío de Paquetes
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto lg:mx-0">
              Entrega rápida y segura de paquetes en minutos. Mismo servicio confiable de WhatsApp Taxi, ahora para tus envíos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-xl">⚡</span>
                <span>Entrega en 15-30 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-xl">🔒</span>
                <span>Rastreo en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-xl">💰</span>
                <span>Precios competitivos</span>
              </div>
            </div>

            <button
              onClick={() => {
                const element = document.getElementById("parcel-booking-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.location.href = "/client-dashboard?tab=parcels";
                }
              }}
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 mt-2"
            >
              Enviar Paquete →
            </button>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
        aria-label="Cerrar promoción"
      >
        <X size={20} className="text-slate-600" />
      </button>
    </div>
  );
}
