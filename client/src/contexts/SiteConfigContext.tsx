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
  logoUrl: string;
  heroBgUrl: string;
  testimonials: Array<{ id: string; name: string; company: string; text: string; rating: number; avatarUrl: string }>;
  notificationEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
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
  logoUrl: "",
  heroBgUrl: "",
  testimonials: [],
  notificationEmail: "admin@whatsapptaxi.com",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "noreply@whatsapptaxi.com",
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

async function fetchConfigFromDB(): Promise<Partial<SiteConfig> | null> {
  try {
    const res = await fetch(
      "/api/trpc/siteSettings.getConfig?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D",
      { credentials: "include" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.[0]?.result?.data?.json;
    return result ?? null;
  } catch {
    return null;
  }
}

async function saveConfigToDB(cfg: SiteConfig): Promise<boolean> {
  try {
    const res = await fetch("/api/trpc/siteSettings.saveConfig?batch=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ "0": { json: { config: JSON.stringify(cfg) } } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface SiteConfigContextValue {
  config: SiteConfig;
  updateConfig: (partial: Partial<SiteConfig>) => void;
  saveConfig: (cfg: SiteConfig) => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: DEFAULT_SITE_CONFIG,
  updateConfig: () => {},
  saveConfig: () => {},
  isSaving: false,
  lastSaved: null,
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(loadConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load from DB on mount using plain fetch (avoids tRPC hook context issues)
  useEffect(() => {
    fetchConfigFromDB().then(dbConfig => {
      if (dbConfig) {
        const merged = { ...DEFAULT_SITE_CONFIG, ...dbConfig };
        setConfig(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    });
  }, []);

  // Listen for storage changes from other tabs
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

  // Poll every 500ms to catch same-tab saves from AdminDashboard
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
    root.style.setProperty("--wataxi-primary", config.primaryColor);
    root.style.setProperty("--wataxi-secondary", config.secondaryColor);
    root.style.setProperty("--wataxi-accent", config.accentColor);
    root.style.setProperty("--wataxi-font", config.fontFamily);
    document.title = config.siteTitle;
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
    setIsSaving(true);
    saveConfigToDB(cfg).then(ok => {
      if (ok) setLastSaved(new Date());
      else console.error("[SiteConfig] Failed to save to DB");
      setIsSaving(false);
    });
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, saveConfig, isSaving, lastSaved }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
