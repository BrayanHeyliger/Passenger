/**
 * PWAInstallBanner — Banner para instalar la PWA en dispositivos móviles y escritorio
 * Detecta el evento beforeinstallprompt y muestra un banner atractivo
 */
import { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem("pwa_banner_dismissed");
    if (dismissed) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    // Listen for beforeinstallprompt (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_banner_dismissed", "1");
  };

  if (installed || !showBanner) return null;

  return (
    <>
      {/* Main install banner - fixed bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300"
        style={{ background: "linear-gradient(135deg, oklch(0.13 0.01 250), oklch(0.16 0.02 200))", borderTop: "1px solid oklch(0.76 0.18 148 / 0.3)" }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {/* App icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))" }}
          >
            <span className="text-2xl">🚕</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
              Instala WhatsApp Taxi
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {isIOS ? "Toca Compartir → Agregar a inicio" : "Acceso rápido desde tu pantalla de inicio"}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <Smartphone size={10} /> Sin descargas
              </span>
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <Monitor size={10} /> Funciona offline
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))", boxShadow: "0 4px 16px oklch(0.52 0.12 148 / 0.4)" }}
            >
              <Download size={14} />
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
              style={{ background: "oklch(0.25 0.01 250)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS instructions modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "oklch(0 0 0 / 0.7)" }}>
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: "oklch(0.16 0.02 200)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>
                Instalar en iPhone/iPad
              </h3>
              <button onClick={() => setShowIOSInstructions(false)} className="text-white/40">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { step: "1", icon: "⬆️", text: "Toca el botón Compartir en Safari (cuadrado con flecha)" },
                { step: "2", icon: "📌", text: "Desplázate hacia abajo y toca \"Agregar a pantalla de inicio\"" },
                { step: "3", icon: "✅", text: "Toca \"Agregar\" en la esquina superior derecha" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "oklch(0.76 0.18 148 / 0.2)", color: "oklch(0.76 0.18 148)" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-white/80 text-sm mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowIOSInstructions(false); handleDismiss(); }}
              className="w-full mt-5 py-3 rounded-2xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.12 148), oklch(0.76 0.18 148))" }}
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
