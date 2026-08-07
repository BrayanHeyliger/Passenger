import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "es" | "en" | "fr";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

type Translations = {
  nav: { features: string; howItWorks: string; modules: string; pricing: string; contact: string; login: string; register: string; requestTrip: string; beDriver: string };
  hero: { badge: string; title1: string; title2: string; title3: string; desc: string; cta: string; demo: string; noContract: string; activation: string; support: string };
  features: { badge: string; title: string; sub: string };
  howItWorks: { badge: string; title: string; sub: string };
  pricing: { badge: string; title: string; sub: string; monthly: string; annual: string; save: string; popular: string; getStarted: string; contact: string };
  cta: { title: string; sub: string; client: string; driver: string };
  footer: { rights: string; privacy: string; terms: string; support: string };
  login: { title: string; sub: string; email: string; password: string; submit: string; noAccount: string; register: string; forgot: string };
  register: { title: string; sub: string; asClient: string; asDriver: string; asFleet: string; clientDesc: string; driverDesc: string; fleetDesc: string; name: string; email: string; phone: string; password: string; submit: string; haveAccount: string; login: string };
  dashboard: { welcome: string; trips: string; earnings: string; rating: string; online: string; offline: string; requestTrip: string; history: string; settings: string; logout: string };
};

const translations: Record<Lang, Translations> = {
  es: {
    nav: { features: "Características", howItWorks: "Cómo funciona", modules: "Módulos", pricing: "Precios", contact: "Contacto", login: "Iniciar sesión", register: "Registrarse", requestTrip: "Pedir un Viaje", beDriver: "Ser Chofer" },
    hero: { badge: "Plataforma SaaS Multitenant", title1: "Gestiona tu flota", title2: "desde WhatsApp", title3: "Sin apps. Sin complicaciones.", desc: "La plataforma SaaS que convierte WhatsApp en tu central de taxis. Recibe pedidos, asigna conductores y gestiona tarifas — todo desde un bot inteligente.", cta: "Empezar gratis", demo: "Ver demo", noContract: "Sin contrato mínimo", activation: "Activación en 48h", support: "Soporte 24/7" },
    features: { badge: "Funcionalidades", title: "Todo lo que necesitas para gestionar tu flota", sub: "Una plataforma completa diseñada para empresas de taxi modernas" },
    howItWorks: { badge: "Proceso", title: "Cómo funciona en 60 segundos", sub: "Desde la solicitud hasta el destino, todo automatizado" },
    pricing: { badge: "Planes", title: "Precios transparentes, sin sorpresas", sub: "Elige el plan que mejor se adapte a tu flota", monthly: "Mensual", annual: "Anual", save: "Ahorra 20%", popular: "Más popular", getStarted: "Empezar ahora", contact: "Contactar ventas" },
    cta: { title: "¿Listo para modernizar tu flota?", sub: "Únete a más de 2,400 empresas de taxi que ya usan WhatsApp Taxi", client: "Pedir un Viaje", driver: "Ser Chofer" },
    footer: { rights: "Todos los derechos reservados", privacy: "Privacidad", terms: "Términos", support: "Soporte" },
    login: { title: "Bienvenido de vuelta", sub: "Ingresa a tu cuenta", email: "Correo electrónico", password: "Contraseña", submit: "Iniciar sesión", noAccount: "¿No tienes cuenta?", register: "Regístrate", forgot: "¿Olvidaste tu contraseña?" },
    register: { title: "Crear cuenta", sub: "Elige cómo quieres usar la plataforma", asClient: "Soy Cliente", asDriver: "Soy Conductor", asFleet: "Empresa / Flotilla", clientDesc: "Pide viajes fácilmente", driverDesc: "Gana dinero conduciendo", fleetDesc: "Gestiona tu propia flota", name: "Nombre completo", email: "Correo electrónico", phone: "Teléfono", password: "Contraseña", submit: "Crear cuenta", haveAccount: "¿Ya tienes cuenta?", login: "Inicia sesión" },
    dashboard: { welcome: "Bienvenido", trips: "Viajes", earnings: "Ganancias", rating: "Calificación", online: "En línea", offline: "Desconectado", requestTrip: "Solicitar viaje", history: "Historial", settings: "Configuración", logout: "Cerrar sesión" },
  },
  en: {
    nav: { features: "Features", howItWorks: "How it works", modules: "Modules", pricing: "Pricing", contact: "Contact", login: "Sign in", register: "Sign up", requestTrip: "Request a Ride", beDriver: "Become a Driver" },
    hero: { badge: "Multitenant SaaS Platform", title1: "Manage your fleet", title2: "via WhatsApp", title3: "No apps. No hassle.", desc: "The SaaS platform that turns WhatsApp into your taxi dispatch center. Receive orders, assign drivers and manage fares — all from an intelligent bot.", cta: "Get started free", demo: "Watch demo", noContract: "No minimum contract", activation: "48h activation", support: "24/7 support" },
    features: { badge: "Features", title: "Everything you need to manage your fleet", sub: "A complete platform designed for modern taxi companies" },
    howItWorks: { badge: "Process", title: "How it works in 60 seconds", sub: "From request to destination, fully automated" },
    pricing: { badge: "Plans", title: "Transparent pricing, no surprises", sub: "Choose the plan that best fits your fleet", monthly: "Monthly", annual: "Annual", save: "Save 20%", popular: "Most popular", getStarted: "Get started", contact: "Contact sales" },
    cta: { title: "Ready to modernize your fleet?", sub: "Join over 2,400 taxi companies already using WhatsApp Taxi", client: "Request a Ride", driver: "Become a Driver" },
    footer: { rights: "All rights reserved", privacy: "Privacy", terms: "Terms", support: "Support" },
    login: { title: "Welcome back", sub: "Sign in to your account", email: "Email address", password: "Password", submit: "Sign in", noAccount: "Don't have an account?", register: "Sign up", forgot: "Forgot your password?" },
    register: { title: "Create account", sub: "Choose how you want to use the platform", asClient: "I'm a Client", asDriver: "I'm a Driver", asFleet: "Company / Fleet", clientDesc: "Request rides easily", driverDesc: "Earn money driving", fleetDesc: "Manage your own fleet", name: "Full name", email: "Email address", phone: "Phone number", password: "Password", submit: "Create account", haveAccount: "Already have an account?", login: "Sign in" },
    dashboard: { welcome: "Welcome", trips: "Trips", earnings: "Earnings", rating: "Rating", online: "Online", offline: "Offline", requestTrip: "Request trip", history: "History", settings: "Settings", logout: "Sign out" },
  },
  fr: {
    nav: { features: "Fonctionnalités", howItWorks: "Comment ça marche", modules: "Modules", pricing: "Tarifs", contact: "Contact", login: "Se connecter", register: "S'inscrire", requestTrip: "Demander un trajet", beDriver: "Devenir chauffeur" },
    hero: { badge: "Plateforme SaaS Multilocataire", title1: "Gérez votre flotte", title2: "via WhatsApp", title3: "Sans apps. Sans complications.", desc: "La plateforme SaaS qui transforme WhatsApp en votre centrale de taxis. Recevez des commandes, assignez des chauffeurs et gérez les tarifs — tout depuis un bot intelligent.", cta: "Commencer gratuitement", demo: "Voir la démo", noContract: "Sans contrat minimum", activation: "Activation en 48h", support: "Support 24/7" },
    features: { badge: "Fonctionnalités", title: "Tout ce dont vous avez besoin pour gérer votre flotte", sub: "Une plateforme complète conçue pour les entreprises de taxi modernes" },
    howItWorks: { badge: "Processus", title: "Comment ça marche en 60 secondes", sub: "De la demande à la destination, tout est automatisé" },
    pricing: { badge: "Plans", title: "Tarifs transparents, sans surprises", sub: "Choisissez le plan qui correspond le mieux à votre flotte", monthly: "Mensuel", annual: "Annuel", save: "Économisez 20%", popular: "Le plus populaire", getStarted: "Commencer", contact: "Contacter les ventes" },
    cta: { title: "Prêt à moderniser votre flotte?", sub: "Rejoignez plus de 2 400 entreprises de taxi qui utilisent déjà WhatsApp Taxi", client: "Demander un trajet", driver: "Devenir chauffeur" },
    footer: { rights: "Tous droits réservés", privacy: "Confidentialité", terms: "Conditions", support: "Support" },
    login: { title: "Bon retour", sub: "Connectez-vous à votre compte", email: "Adresse e-mail", password: "Mot de passe", submit: "Se connecter", noAccount: "Vous n'avez pas de compte?", register: "S'inscrire", forgot: "Mot de passe oublié?" },
    register: { title: "Créer un compte", sub: "Choisissez comment vous souhaitez utiliser la plateforme", asClient: "Je suis client", asDriver: "Je suis chauffeur", asFleet: "Entreprise / Flotte", clientDesc: "Demandez des trajets facilement", driverDesc: "Gagnez de l'argent en conduisant", fleetDesc: "Gérez votre propre flotte", name: "Nom complet", email: "Adresse e-mail", phone: "Numéro de téléphone", password: "Mot de passe", submit: "Créer un compte", haveAccount: "Vous avez déjà un compte?", login: "Se connecter" },
    dashboard: { welcome: "Bienvenue", trips: "Trajets", earnings: "Revenus", rating: "Note", online: "En ligne", offline: "Hors ligne", requestTrip: "Demander un trajet", history: "Historique", settings: "Paramètres", logout: "Se déconnecter" },
  },
};

type I18nContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

const I18nContext = createContext<I18nContextType>({
  lang: "es",
  setLang: () => {},
  t: translations.es,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("wataxi_lang") as Lang;
    return saved && ["es", "en", "fr"].includes(saved) ? saved : "es";
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("wataxi_lang", newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
