import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SiteConfig {
  siteTitle: string;
  tagline: string;
  heroTitle: string;
  heroDesc: string;
  ctaText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerText: string;
  footerLinks: string;
  metaDescription: string;
  metaKeywords: string;
  showAnimations: boolean;
  showPricing: boolean;
  showTestimonials: boolean;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  commissionRate: string;
  basefare: string;
  pricePerKm: string;
  surgePricing: boolean;
  surgeMultiplier: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteTitle: "WhatsApp Taxi SaaS",
  tagline: "Gestiona tu flota desde WhatsApp",
  heroTitle: "Gestiona tu flota desde WhatsApp. Sin apps. Sin complicaciones.",
  heroDesc: "La plataforma SaaS que convierte WhatsApp en tu central de taxis. Recibe pedidos, asigna conductores y gestiona tarifas — todo desde un bot inteligente.",
  ctaText: "Empezar gratis",
  primaryColor: "#25D366",
  secondaryColor: "#0d1117",
  accentColor: "#128C7E",
  fontFamily: "Sora",
  contactEmail: "soporte@whatsapptaxi.com",
  contactPhone: "+1 800 TAXI BOT",
  contactAddress: "Ciudad de México, México",
  footerText: "© 2025 WhatsApp Taxi SaaS. Todos los derechos reservados.",
  footerLinks: "Privacidad | Términos | Soporte",
  metaDescription: "Plataforma SaaS para empresas de taxi. Recibe pedidos por WhatsApp.",
  metaKeywords: "taxi, whatsapp, saas, flota, conductor",
  showAnimations: true,
  showPricing: true,
  showTestimonials: false,
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: false,
  commissionRate: "20",
  basefare: "2.50",
  pricePerKm: "1.20",
  surgePricing: true,
  surgeMultiplier: "1.5",
};

const STORAGE_KEY = "wataxi_site_config";

function loadConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

interface SiteConfigContextValue {
  config: SiteConfig;
  updateConfig: (partial: Partial<SiteConfig>) => void;
  saveConfig: (cfg: SiteConfig) => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: DEFAULT_SITE_CONFIG,
  updateConfig: () => {},
  saveConfig: () => {},
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);

  // Listen for storage changes from other tabs (e.g. admin panel saving)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setConfig({ ...DEFAULT_SITE_CONFIG, ...JSON.parse(e.newValue) });
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Also poll every 500ms to catch same-tab saves from AdminDashboard
  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = loadConfig();
      setConfig(prev => {
        const prevStr = JSON.stringify(prev);
        const freshStr = JSON.stringify(fresh);
        return prevStr === freshStr ? prev : fresh;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Apply CSS variables whenever config changes
  useEffect(() => {
    const root = document.documentElement;
    // Convert hex to OKLCH approximation via a CSS custom property
    root.style.setProperty("--wataxi-primary", config.primaryColor);
    root.style.setProperty("--wataxi-secondary", config.secondaryColor);
    root.style.setProperty("--wataxi-accent", config.accentColor);
    root.style.setProperty("--wataxi-font", config.fontFamily);
    // Update document title
    document.title = config.siteTitle;
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", config.metaDescription);
  }, [config]);

  const updateConfig = (partial: Partial<SiteConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const saveConfig = (cfg: SiteConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setConfig(cfg);
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, saveConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
