import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface SiteConfig {
  vehicles: Array<{
    id: string;
    label: string;
    emoji: string;
    base: number;
    perKm: number;
    eta: string;
    seats: number;
    active: boolean;
  }>;
  extras: Array<{
    id: string;
    label: string;
    icon: string;
    price: number;
    active: boolean;
  }>;
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
  testimonials: Array<{
    id: string;
    name: string;
    company: string;
    text: string;
    rating: number;
    avatarUrl: string;
  }>;
  notificationEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  vehicles: [
    {
      id: "economy",
      label: "Económico",
      emoji: "🚗",
      base: 6,
      perKm: 0.9,
      eta: "3 min",
      seats: 4,
      active: true,
    },
    {
      id: "comfort",
      label: "Confort",
      emoji: "🚙",
      base: 9,
      perKm: 1.3,
      eta: "5 min",
      seats: 4,
      active: true,
    },
    {
      id: "premium",
      label: "Premium",
      emoji: "🚘",
      base: 14,
      perKm: 1.8,
      eta: "7 min",
      seats: 4,
      active: true,
    },
    {
      id: "suv",
      label: "SUV",
      emoji: "🚐",
      base: 18,
      perKm: 2.2,
      eta: "8 min",
      seats: 6,
      active: true,
    },
  ],
  extras: [
    { id: "pet", label: "Mascota", icon: "🐾", price: 2, active: true },
    { id: "luggage", label: "Maletas", icon: "🧳", price: 1, active: true },
    {
      id: "child_seat",
      label: "Silla de niño",
      icon: "👶",
      price: 3,
      active: true,
    },
    {
      id: "wheelchair",
      label: "Silla de ruedas",
      icon: "♿",
      price: 0,
      active: true,
    },
    {
      id: "music",
      label: "Música a gusto",
      icon: "🎵",
      price: 0,
      active: true,
    },
  ],
  siteTitle: "UnPasajero.Com · Orlando Mobility",
  tagline: "Movilidad clara para pasajeros, conductores y flotillas",
  heroTitle: "Conecta pasajeros y conductores con una experiencia clara.",
  heroDesc:
    "La plataforma de movilidad que integra reserva, asignación, seguimiento y operación de flotillas.",
  ctaText: "Empezar gratis",
  primaryColor: "#25D366",
  secondaryColor: "#0d1117",
  accentColor: "#128C7E",
  fontFamily: "Sora",
  contactEmail: "support@unpasajero.com",
  contactPhone: "+1 (407) 555-0100",
  contactAddress: "Orlando, Florida, USA",
  footerText: "© 2026 UnPasajero.Com. Todos los derechos reservados.",
  footerLinks: "Privacidad | Términos | Soporte",
  metaDescription:
    "Plataforma de movilidad para pasajeros, conductores y flotillas.",
  metaKeywords: "taxi, movilidad, saas, flotilla, conductor",
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
    const merged = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
    const legacyMarker =
      `${merged.siteTitle} ${merged.contactEmail} ${merged.contactPhone} ${merged.contactAddress} ${merged.footerText}`.toLowerCase();
    if (
      legacyMarker.includes("saytaxi") ||
      legacyMarker.includes("méxico") ||
      legacyMarker.includes("mexico")
    ) {
      const localized = {
        ...merged,
        siteTitle: DEFAULT_SITE_CONFIG.siteTitle,
        contactEmail: DEFAULT_SITE_CONFIG.contactEmail,
        contactPhone: DEFAULT_SITE_CONFIG.contactPhone,
        contactAddress: DEFAULT_SITE_CONFIG.contactAddress,
        footerText: DEFAULT_SITE_CONFIG.footerText,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localized));
      return localized;
    }
    return merged;
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
    <SiteConfigContext.Provider
      value={{ config, updateConfig, saveConfig, isSaving, lastSaved }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
