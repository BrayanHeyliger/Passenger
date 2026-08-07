import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { LanguageSelectorLight } from "@/components/LanguageSelector";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapView } from "@/components/Map";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Car, Navigation, DollarSign, Settings,
  Bell, LogOut, Search, Eye, Phone, MessageCircle, UserCheck, UserX,
  BarChart2, TrendingUp, MapPin, AlertTriangle, Star, Send,
  Shield, Edit3, Save, Globe, Palette, Layers, Sliders,
  CheckCircle, XCircle, Clock, Mail, Smartphone, FileText,
  Monitor, ChevronRight, Download, RefreshCw, RotateCcw, ExternalLink, Upload, ImageIcon, Loader2, Database
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

type Tab = "overview" | "godsEye" | "drivers" | "clients" | "trips" | "messages" | "permissions" | "editor" | "analytics" | "settings";
type EditorSection = "hero" | "colors" | "contact" | "footer" | "meta" | "features" | "pricing" | "testimonials" | "email";
type EditorView = "form" | "preview";

interface Driver { id: string; name: string; phone: string; email: string; vehicle: string; plate: string; status: "active" | "inactive" | "suspended" | "pending"; rating: number; trips: number; earnings: string; joinDate: string; online: boolean; permissions: { canAcceptTrips: boolean; canSetOwnFare: boolean; canViewClientPhone: boolean; canCancelTrip: boolean; }; }
interface Client { id: string; name: string; phone: string; email: string; trips: number; spent: string; rating: number; joinDate: string; status: "active" | "suspended"; }
interface SentMessage { id: string; to: string; subject: string; body: string; channel: string; date: string; }

const MOCK_DRIVERS: Driver[] = [
  { id: "d1", name: "Carlos Mendoza", phone: "+52 55 1234 5678", email: "carlos@email.com", vehicle: "Toyota Corolla 2022", plate: "ABC-123", status: "active", rating: 4.9, trips: 342, earnings: "$8,450", joinDate: "2024-01-15", online: true, permissions: { canAcceptTrips: true, canSetOwnFare: false, canViewClientPhone: true, canCancelTrip: true } },
  { id: "d2", name: "Pedro Ramírez", phone: "+52 55 9876 5432", email: "pedro@email.com", vehicle: "Honda Civic 2021", plate: "XYZ-789", status: "active", rating: 4.7, trips: 218, earnings: "$5,320", joinDate: "2024-03-20", online: true, permissions: { canAcceptTrips: true, canSetOwnFare: false, canViewClientPhone: true, canCancelTrip: true } },
  { id: "d3", name: "Luis Sánchez", phone: "+52 55 5555 4444", email: "luis@email.com", vehicle: "Nissan Sentra 2020", plate: "DEF-456", status: "inactive", rating: 4.5, trips: 156, earnings: "$3,890", joinDate: "2024-06-10", online: false, permissions: { canAcceptTrips: false, canSetOwnFare: false, canViewClientPhone: false, canCancelTrip: false } },
  { id: "d4", name: "Miguel Ángel Torres", phone: "+52 55 3333 2222", email: "miguel@email.com", vehicle: "Volkswagen Jetta 2023", plate: "GHI-012", status: "pending", rating: 0, trips: 0, earnings: "$0", joinDate: "2025-01-05", online: false, permissions: { canAcceptTrips: false, canSetOwnFare: false, canViewClientPhone: false, canCancelTrip: false } },
  { id: "d5", name: "Roberto Díaz", phone: "+52 55 7777 8888", email: "roberto@email.com", vehicle: "Chevrolet Aveo 2019", plate: "JKL-345", status: "suspended", rating: 3.2, trips: 45, earnings: "$1,120", joinDate: "2024-08-22", online: false, permissions: { canAcceptTrips: false, canSetOwnFare: false, canViewClientPhone: false, canCancelTrip: false } },
];

const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "María García", phone: "+52 55 1111 2222", email: "maria@email.com", trips: 28, spent: "$420", rating: 4.8, joinDate: "2024-02-10", status: "active" },
  { id: "c2", name: "Juan López", phone: "+52 55 3333 4444", email: "juan@email.com", trips: 15, spent: "$225", rating: 4.5, joinDate: "2024-04-15", status: "active" },
  { id: "c3", name: "Ana Martínez", phone: "+52 55 5555 6666", email: "ana@email.com", trips: 42, spent: "$630", rating: 5.0, joinDate: "2024-01-20", status: "active" },
  { id: "c4", name: "Roberto Díaz", phone: "+52 55 7777 8888", email: "roberto2@email.com", trips: 8, spent: "$120", rating: 3.5, joinDate: "2024-09-01", status: "suspended" },
  { id: "c5", name: "Laura Pérez", phone: "+52 55 9999 0000", email: "laura@email.com", trips: 63, spent: "$945", rating: 4.9, joinDate: "2023-12-05", status: "active" },
];

const weeklyData = [
  { day: "Lun", viajes: 38, ingresos: 760 }, { day: "Mar", viajes: 52, ingresos: 1040 },
  { day: "Mié", viajes: 45, ingresos: 900 }, { day: "Jue", viajes: 61, ingresos: 1220 },
  { day: "Vie", viajes: 78, ingresos: 1560 }, { day: "Sáb", viajes: 95, ingresos: 1900 },
  { day: "Dom", viajes: 72, ingresos: 1440 },
];

const monthlyData = [
  { month: "Ene", viajes: 820, ingresos: 16400 }, { month: "Feb", viajes: 950, ingresos: 19000 },
  { month: "Mar", viajes: 1100, ingresos: 22000 }, { month: "Abr", viajes: 980, ingresos: 19600 },
  { month: "May", viajes: 1250, ingresos: 25000 }, { month: "Jun", viajes: 1400, ingresos: 28000 },
  { month: "Jul", viajes: 1350, ingresos: 27000 },
];

const vehicleData = [
  { name: "Económico", value: 45, color: "#25D366" }, { name: "Confort", value: 30, color: "#3B82F6" },
  { name: "Premium", value: 15, color: "#8B5CF6" }, { name: "SUV", value: 10, color: "#F59E0B" },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700", inactive: "bg-slate-100 text-slate-600",
  suspended: "bg-red-100 text-red-700", pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700", in_progress: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700", requested: "bg-yellow-100 text-yellow-700",
};
const statusLabels: Record<string, string> = {
  active: "Activo", inactive: "Inactivo", suspended: "Suspendido", pending: "Pendiente",
  completed: "Completado", in_progress: "En progreso", cancelled: "Cancelado", requested: "Solicitado",
};

const defaultSiteConfig = {
  siteTitle: "WhatsApp Taxi SaaS", tagline: "Gestiona tu flota desde WhatsApp",
  heroTitle: "Gestiona tu flota desde WhatsApp. Sin apps. Sin complicaciones.",
  heroDesc: "La plataforma SaaS que convierte WhatsApp en tu central de taxis. Recibe pedidos, asigna conductores y gestiona tarifas — todo desde un bot inteligente.",
  ctaText: "Empezar gratis", primaryColor: "#25D366", secondaryColor: "#0d1117",
  accentColor: "#128C7E", fontFamily: "Sora", contactEmail: "soporte@whatsapptaxi.com",
  contactPhone: "+1 800 TAXI BOT", contactAddress: "Ciudad de México, México",
  footerText: "© 2025 WhatsApp Taxi SaaS. Todos los derechos reservados.",
  footerLinks: "Privacidad | Términos | Soporte",
  metaDescription: "Plataforma SaaS para empresas de taxi. Recibe pedidos por WhatsApp.",
  metaKeywords: "taxi, whatsapp, saas, flota, conductor",
  showAnimations: true, showPricing: true, showTestimonials: false,
  maintenanceMode: false, allowRegistration: true, requireEmailVerification: false,
  commissionRate: "20", basefare: "2.50", pricePerKm: "1.20",
  surgePricing: true, surgeMultiplier: "1.5",
  logoUrl: "",
};

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useLocalAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const { config: globalConfig, saveConfig: saveGlobalConfig } = useSiteConfig();
  const { isSaving, lastSaved } = useSiteConfig();
  const [siteConfig, setSiteConfig] = useState(defaultSiteConfig);
  const [editorView, setEditorView] = useState<EditorView>("form");
  const [previewKey, setPreviewKey] = useState(0);

  // Sync local editor state from global config on mount
  useEffect(() => {
    setSiteConfig(prev => ({ ...prev, ...globalConfig }));
  }, []);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [messageForm, setMessageForm] = useState({ to: "all_clients", subject: "", body: "", channel: "push" });
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([
    { id: "m1", to: "all_clients", subject: "¡Bienvenido a WhatsApp Taxi!", body: "Gracias por registrarte.", channel: "push", date: "Hoy 09:00" },
    { id: "m2", to: "all_drivers", subject: "Actualización de tarifas", body: "Las tarifas se han actualizado.", channel: "email", date: "Ayer 14:30" },
  ]);
  const [editorSection, setEditorSection] = useState<EditorSection>("hero");
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    MOCK_DRIVERS.forEach(driver => {
      const colors: Record<string, string> = { active: "#25D366", on_trip: "#3B82F6", inactive: "#9CA3AF", pending: "#F59E0B", suspended: "#EF4444" };
      const el = document.createElement("div");
      el.style.cssText = `width:36px;height:36px;border-radius:50%;background:${colors[driver.status] || "#9CA3AF"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:13px;cursor:pointer;`;
      el.textContent = driver.name[0];
      el.title = `${driver.name} — ${statusLabels[driver.status]}`;
      const positions: Record<string, { lat: number; lng: number }> = {
        d1: { lat: 19.44, lng: -99.14 }, d2: { lat: 19.43, lng: -99.13 },
        d3: { lat: 19.45, lng: -99.15 }, d4: { lat: 19.42, lng: -99.12 }, d5: { lat: 19.46, lng: -99.16 },
      };
      new google.maps.marker.AdvancedMarkerElement({ map, position: positions[driver.id] || { lat: 19.43, lng: -99.13 }, content: el, title: driver.name });
    });
  }, []);

  const handleDriverAction = (driverId: string, action: "approve" | "suspend" | "activate" | "delete") => {
    setDrivers(prev => prev.map(d => {
      if (d.id !== driverId) return d;
      if (action === "approve") return { ...d, status: "active" as const };
      if (action === "suspend") return { ...d, status: "suspended" as const, online: false };
      if (action === "activate") return { ...d, status: "active" as const };
      return d;
    }).filter(d => action === "delete" ? d.id !== driverId : true));
    toast.success({ approve: "Conductor aprobado ✅", suspend: "Conductor suspendido", activate: "Conductor activado ✅", delete: "Conductor eliminado" }[action]);
  };

  const handlePermissionToggle = (driverId: string, perm: keyof Driver["permissions"]) => {
    setDrivers(prev => prev.map(d => d.id !== driverId ? d : { ...d, permissions: { ...d.permissions, [perm]: !d.permissions[perm] } }));
    toast.success("Permiso actualizado");
  };

  const handleClientAction = (clientId: string, action: "suspend" | "activate") => {
    setClients(prev => prev.map(c => c.id !== clientId ? c : { ...c, status: action === "suspend" ? "suspended" as const : "active" as const }));
    toast.success(action === "suspend" ? "Cliente suspendido" : "Cliente activado ✅");
  };

  const handleSendMessage = () => {
    if (!messageForm.subject || !messageForm.body) { toast.error("Completa el asunto y el mensaje"); return; }
    setSentMessages(prev => [{ id: `m${Date.now()}`, to: messageForm.to, subject: messageForm.subject, body: messageForm.body, channel: messageForm.channel, date: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) }, ...prev]);
    setMessageForm({ to: "all_clients", subject: "", body: "", channel: "push" });
    toast.success("Mensaje enviado ✅");
  };

  const handleSaveConfig = () => {
    saveGlobalConfig(siteConfig as any);
    setPreviewKey(k => k + 1);
    toast.success("Guardando en base de datos...");
  };

  const handleResetConfig = () => {
    setSiteConfig(defaultSiteConfig);
    saveGlobalConfig(defaultSiteConfig as any);
    toast.success("Configuración restablecida a valores por defecto ✅");
  };

  const tabs: { id: Tab; label: string; icon: any; badge?: number; dot?: boolean }[] = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "godsEye", label: "God's Eye", icon: Eye, dot: true },
    { id: "drivers", label: "Conductores", icon: Car, badge: drivers.filter(d => d.status === "pending").length },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "trips", label: "Viajes", icon: Navigation },
    { id: "messages", label: "Mensajes", icon: MessageCircle },
    { id: "permissions", label: "Permisos", icon: Shield },
    { id: "editor", label: "Editor Web", icon: Edit3 },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-xl">🛡️</div>
            <div><p className="font-bold text-sm text-white">Super Admin</p><p className="text-xs text-green-400">Acceso total al sistema</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-green-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <tab.icon size={16} />
              <span className="flex-1 text-left">{tab.label}</span>
              {(tab.badge ?? 0) > 0 && <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{tab.badge}</span>}
              {tab.dot && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">{user?.name?.[0] || "A"}</div>
            <div><p className="text-sm font-medium text-white">{user?.name || "Heyliger"}</p><p className="text-xs text-green-400">Super Admin</p></div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }} className="w-full gap-2 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white text-xs">
            <LogOut size={13} /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-sm text-slate-500">Panel de Super Administrador</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelectorLight />
            <button className="relative p-2 rounded-lg hover:bg-slate-100">
              <Bell size={20} className="text-slate-600" />
              {drivers.filter(d => d.status === "pending").length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <Button variant="outline" size="sm" className="gap-2 text-sm"><RefreshCw size={14} /> Actualizar</Button>
          </div>
        </header>

        <div className="p-6">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Conductores Activos", value: `${drivers.filter(d => d.status === "active").length}/${drivers.length}`, sub: `${drivers.filter(d => d.online).length} en línea`, icon: Car, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Clientes Totales", value: clients.length, sub: `${clients.filter(c => c.status === "active").length} activos`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Viajes Este Mes", value: "1,350", sub: "+8% vs mes anterior", icon: Navigation, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Ingresos Mes", value: "$27,000", sub: "+12% vs mes anterior", icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50" },
                ].map((kpi, i) => (
                  <Card key={i} className="p-4">
                    <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-2`}><kpi.icon size={20} className={kpi.color} /></div>
                    <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-sm font-medium text-slate-700">{kpi.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{kpi.sub}</p>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Ingresos Mensuales</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyData}>
                      <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#25D366" stopOpacity={0.3} /><stop offset="95%" stopColor="#25D366" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
                      <Area type="monotone" dataKey="ingresos" stroke="#25D366" strokeWidth={2.5} fill="url(#grad)" name="Ingresos $" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Por Tipo de Vehículo</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart><Pie data={vehicleData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">{vehicleData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={(v) => `${v}%`} /></PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">{vehicleData.map(v => (<div key={v.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} /><span className="text-slate-600">{v.name}</span></div><span className="font-semibold">{v.value}%</span></div>))}</div>
                </Card>
              </div>
              {drivers.filter(d => d.status === "pending").length > 0 && (
                <Card className="p-4 border-yellow-200 bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-600" />
                    <p className="text-sm font-semibold text-yellow-800">{drivers.filter(d => d.status === "pending").length} conductor(es) esperando aprobación</p>
                    <Button size="sm" onClick={() => setActiveTab("drivers")} className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white text-xs gap-1">Ver <ChevronRight size={12} /></Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── GOD'S EYE ── */}
          {activeTab === "godsEye" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-bold text-slate-900">God's Eye — Mapa en Tiempo Real</h2><p className="text-sm text-slate-500">Todos los conductores activos en tiempo real</p></div>
                <div className="flex gap-3 text-xs">
                  {[{ color: "bg-green-500", label: "Disponible" }, { color: "bg-blue-500", label: "En viaje" }, { color: "bg-slate-400", label: "Inactivo" }, { color: "bg-red-500", label: "Suspendido" }].map(s => (
                    <div key={s.label} className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-full ${s.color}`} /><span className="text-slate-600">{s.label}</span></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  <Card className="overflow-hidden" style={{ height: "500px", position: "relative" }}>
                    <MapView initialCenter={{ lat: 19.4326, lng: -99.1332 }} initialZoom={13} onMapReady={handleMapReady} className="absolute inset-0 w-full h-full" />
                  </Card>
                </div>
                <div className="space-y-3">
                  <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 text-sm mb-3">Conductores</h3>
                    <div className="space-y-2">
                      {drivers.map(d => (
                        <div key={d.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50">
                          <div className="relative"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">{d.name[0]}</div>{d.online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full" />}</div>
                          <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-900 truncate">{d.name.split(" ")[0]}</p><p className="text-xs text-slate-500 truncate">{d.vehicle.split(" ")[0]}</p></div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[d.status]}`}>{d.online ? "●" : "○"}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 text-sm mb-2">Estadísticas Live</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">En línea</span><span className="font-bold text-green-600">{drivers.filter(d => d.online).length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Pendientes</span><span className="font-bold text-yellow-600">{drivers.filter(d => d.status === "pending").length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Suspendidos</span><span className="font-bold text-red-600">{drivers.filter(d => d.status === "suspended").length}</span></div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ── CONDUCTORES ── */}
          {activeTab === "drivers" && (
            <div className="space-y-4">
              {drivers.filter(d => d.status === "pending").length > 0 && (
                <Card className="p-4 border-yellow-200 bg-yellow-50">
                  <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-yellow-600" /><h3 className="font-semibold text-yellow-800">Pendientes de aprobación</h3></div>
                  {drivers.filter(d => d.status === "pending").map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-t border-yellow-200">
                      <div><p className="font-medium text-slate-900 text-sm">{d.name}</p><p className="text-xs text-slate-500">{d.vehicle} · {d.phone}</p></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDriverAction(d.id, "approve")} className="bg-green-500 hover:bg-green-600 text-white text-xs gap-1"><UserCheck size={12} /> Aprobar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDriverAction(d.id, "delete")} className="text-red-500 border-red-200 text-xs gap-1"><UserX size={12} /> Rechazar</Button>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
              <div className="flex gap-3">
                <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Buscar conductor..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <Button variant="outline" className="gap-2 text-sm"><Download size={15} /> Exportar</Button>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200"><tr>{["Conductor", "Vehículo", "Estado", "Rating", "Viajes", "Ganancias", "Acciones"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {drivers.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase())).map(d => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">{d.name[0]}</div>{d.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />}</div><div><p className="font-semibold text-slate-900">{d.name}</p><p className="text-xs text-slate-500">{d.phone}</p></div></div></td>
                          <td className="px-4 py-3"><p className="text-slate-900">{d.vehicle}</p><p className="text-xs text-slate-500 font-mono">{d.plate}</p></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[d.status]}`}>{statusLabels[d.status]}</span></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-1"><Star size={13} className="text-yellow-500 fill-yellow-500" /><span className="font-semibold">{d.rating || "—"}</span></div></td>
                          <td className="px-4 py-3 font-medium">{d.trips}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{d.earnings}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingDriver(d)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500" title="Permisos"><Shield size={14} /></button>
                              <button onClick={() => window.location.href = `tel:${d.phone}`} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" title="Llamar"><Phone size={14} /></button>
                              {d.status === "active" && <button onClick={() => handleDriverAction(d.id, "suspend")} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Suspender"><UserX size={14} /></button>}
                              {(d.status === "suspended" || d.status === "inactive") && <button onClick={() => handleDriverAction(d.id, "activate")} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" title="Activar"><UserCheck size={14} /></button>}
                              {d.status === "pending" && <button onClick={() => handleDriverAction(d.id, "approve")} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Aprobar"><CheckCircle size={14} /></button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ── CLIENTES ── */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <Button variant="outline" className="gap-2 text-sm"><Download size={15} /> Exportar CSV</Button>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200"><tr>{["Cliente", "Contacto", "Viajes", "Gastado", "Rating", "Estado", "Acciones"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">{c.name[0]}</div><div><p className="font-semibold text-slate-900">{c.name}</p><p className="text-xs text-slate-500">Desde {c.joinDate}</p></div></div></td>
                          <td className="px-4 py-3"><p className="text-slate-900">{c.phone}</p><p className="text-xs text-slate-500">{c.email}</p></td>
                          <td className="px-4 py-3 font-medium">{c.trips}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{c.spent}</td>
                          <td className="px-4 py-3"><div className="flex items-center gap-1"><Star size={13} className="text-yellow-500 fill-yellow-500" /><span className="font-semibold">{c.rating}</span></div></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.status === "active" ? "Activo" : "Suspendido"}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => window.location.href = `tel:${c.phone}`} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" title="Llamar"><Phone size={14} /></button>
                              <button onClick={() => { setActiveTab("messages"); setMessageForm(f => ({ ...f, to: "specific", subject: `Mensaje para ${c.name}` })); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Mensaje"><MessageCircle size={14} /></button>
                              {c.status === "active" ? <button onClick={() => handleClientAction(c.id, "suspend")} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Suspender"><UserX size={14} /></button> : <button onClick={() => handleClientAction(c.id, "activate")} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" title="Activar"><UserCheck size={14} /></button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ── VIAJES ── */}
          {activeTab === "trips" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[{ label: "Total Hoy", value: "47", color: "text-slate-700" }, { label: "Completados", value: "38", color: "text-green-600" }, { label: "En progreso", value: "6", color: "text-blue-600" }, { label: "Cancelados", value: "3", color: "text-red-600" }].map((s, i) => (
                  <Card key={i} className="p-4 text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-slate-500 mt-1">{s.label}</p></Card>
                ))}
              </div>
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Viajes en Tiempo Real</h3>
                <div className="space-y-3">
                  {[{ client: "María García", driver: "Carlos M.", from: "Centro", to: "Aeropuerto", fare: "$42", status: "in_progress", time: "10:32" }, { client: "Juan López", driver: "Pedro R.", from: "Metro", to: "Hotel", fare: "$18", status: "completed", time: "10:45" }, { client: "Ana Martínez", driver: "—", from: "Hospital", to: "Centro", fare: "$15", status: "requested", time: "10:51" }].map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${t.status === "in_progress" ? "bg-blue-500 animate-pulse" : t.status === "completed" ? "bg-green-500" : "bg-yellow-500"}`} />
                        <div><p className="text-sm font-semibold text-slate-900">{t.client} → {t.driver}</p><p className="text-xs text-slate-500">{t.from} → {t.to}</p></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-green-600">{t.fare}</p><p className="text-xs text-slate-500">{t.time}</p></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── MENSAJES ── */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Send size={16} className="text-green-500" /> Enviar Mensaje</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Destinatarios</label>
                    <select value={messageForm.to} onChange={e => setMessageForm(f => ({ ...f, to: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none">
                      <option value="all_clients">👥 Todos los clientes ({clients.filter(c => c.status === "active").length} activos)</option>
                      <option value="all_drivers">🚗 Todos los conductores ({drivers.filter(d => d.status === "active").length} activos)</option>
                      <option value="specific">📧 Usuario específico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Canal</label>
                    <div className="flex gap-2">
                      {[{ value: "push", label: "Push", icon: Bell }, { value: "email", label: "Email", icon: Mail }, { value: "sms", label: "SMS", icon: Smartphone }].map(ch => (
                        <button key={ch.value} onClick={() => setMessageForm(f => ({ ...f, channel: ch.value }))} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-colors ${messageForm.channel === ch.value ? "bg-green-500 text-white border-green-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          <ch.icon size={14} />{ch.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto</label>
                    <input type="text" value={messageForm.subject} onChange={e => setMessageForm(f => ({ ...f, subject: e.target.value }))} placeholder="Ej: Actualización importante" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje</label>
                    <textarea value={messageForm.body} onChange={e => setMessageForm(f => ({ ...f, body: e.target.value }))} placeholder="Escribe tu mensaje..." rows={4} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                  </div>
                  <Button onClick={handleSendMessage} className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"><Send size={15} /> Enviar mensaje</Button>
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><FileText size={16} className="text-slate-500" /> Mensajes Enviados</h3>
                <div className="space-y-3">
                  {sentMessages.map(m => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1"><p className="font-semibold text-slate-900 text-sm">{m.subject}</p><p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.body}</p></div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.channel === "push" ? "bg-purple-100 text-purple-700" : m.channel === "email" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{m.channel.toUpperCase()}</span>
                          <span className="text-xs text-slate-400">{m.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">Para: {m.to === "all_clients" ? "Todos los clientes" : m.to === "all_drivers" ? "Todos los conductores" : "Específico"}</span>
                        <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={11} /> Enviado</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── PERMISOS ── */}
          {activeTab === "permissions" && (
            <div className="space-y-4">
              <Card className="p-4 bg-blue-50 border-blue-200"><div className="flex items-center gap-2"><Shield size={16} className="text-blue-600" /><p className="text-sm text-blue-800 font-medium">Gestiona los permisos individuales de cada conductor. Los cambios se aplican inmediatamente.</p></div></Card>
              <div className="space-y-3">
                {drivers.filter(d => d.status !== "pending").map(d => (
                  <Card key={d.id} className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">{d.name[0]}</div>{d.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}</div>
                      <div className="flex-1"><p className="font-semibold text-slate-900">{d.name}</p><p className="text-xs text-slate-500">{d.vehicle} · <span className={`font-medium ${d.status === "active" ? "text-green-600" : "text-red-600"}`}>{statusLabels[d.status]}</span></p></div>
                      <div className="flex items-center gap-1"><Star size={13} className="text-yellow-500 fill-yellow-500" /><span className="text-sm font-bold text-slate-700">{d.rating || "—"}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "canAcceptTrips" as const, label: "Aceptar viajes", desc: "Puede recibir solicitudes", icon: Navigation },
                        { key: "canViewClientPhone" as const, label: "Ver teléfono del cliente", desc: "Acceso al número del pasajero", icon: Phone },
                        { key: "canSetOwnFare" as const, label: "Establecer tarifa propia", desc: "Puede modificar el precio", icon: DollarSign },
                        { key: "canCancelTrip" as const, label: "Cancelar viajes", desc: "Puede cancelar viajes aceptados", icon: XCircle },
                      ].map(perm => (
                        <div key={perm.key} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${d.permissions[perm.key] ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${d.permissions[perm.key] ? "bg-green-500" : "bg-slate-300"}`}><perm.icon size={14} className="text-white" /></div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900">{perm.label}</p><p className="text-xs text-slate-500 mt-0.5">{perm.desc}</p></div>
                          <button onClick={() => handlePermissionToggle(d.id, perm.key)} className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${d.permissions[perm.key] ? "bg-green-500" : "bg-slate-300"}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${d.permissions[perm.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── EDITOR WEB ── */}
          {activeTab === "editor" && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => setEditorView("form")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editorView === "form" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    <Edit3 size={14} /> Editor
                  </button>
                  <button onClick={() => { handleSaveConfig(); setEditorView("preview"); setPreviewKey(k => k + 1); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editorView === "preview" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    <Eye size={14} /> Vista previa
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetConfig} className="gap-2 text-sm text-red-500 border-red-200 hover:bg-red-50">
                    <RotateCcw size={14} /> Restablecer
                  </Button>
                  <Button size="sm" onClick={handleSaveConfig} className="gap-2 text-sm bg-green-500 hover:bg-green-600 text-white">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 text-sm">
                      <ExternalLink size={14} /> Ver sitio
                    </Button>
                  </a>
                  {lastSaved && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      <Database size={12} />
                      Guardado en BD · {lastSaved.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview iframe */}
              {editorView === "preview" && (
                <Card className="overflow-hidden" style={{ height: "600px" }}>
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                      <span className="text-xs text-slate-500 font-mono ml-2">whatsapptaxi.com — Vista previa en vivo</span>
                    </div>
                    <button onClick={() => setPreviewKey(k => k + 1)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
                      <RefreshCw size={12} /> Recargar
                    </button>
                  </div>
                  <iframe
                    key={previewKey}
                    src="/"
                    className="w-full border-0"
                    style={{ height: "calc(100% - 40px)" }}
                    title="Vista previa del landing"
                  />
                </Card>
              )}

              {/* Editor form */}
              {editorView === "form" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                {[
                  { id: "hero" as EditorSection, label: "Hero / Inicio", icon: Monitor },
                  { id: "colors" as EditorSection, label: "Colores y Fuentes", icon: Palette },
                  { id: "contact" as EditorSection, label: "Contacto", icon: Phone },
                  { id: "footer" as EditorSection, label: "Footer", icon: Layers },
                  { id: "meta" as EditorSection, label: "SEO / Meta Tags", icon: Globe },
                  { id: "features" as EditorSection, label: "Funcionalidades", icon: Sliders },
                  { id: "pricing" as EditorSection, label: "Precios y Tarifas", icon: DollarSign },
                  { id: "testimonials" as EditorSection, label: "Testimonios", icon: Star },
                  { id: "email" as EditorSection, label: "Email / SMTP", icon: Mail },
                ].map(s => (
                  <button key={s.id} onClick={() => setEditorSection(s.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${editorSection === s.id ? "bg-green-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                    <s.icon size={15} />{s.label}
                  </button>
                ))}
                <Button onClick={handleSaveConfig} className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white gap-2 text-sm"><Save size={14} /> Guardar cambios</Button>
              </div>
              <Card className="lg:col-span-3 p-5">
                {editorSection === "hero" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Monitor size={16} /> Sección Hero / Inicio</h3>
                    {/* Logo Upload */}
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2"><ImageIcon size={15} className="text-green-500" /> Logo del sitio</p>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center flex-shrink-0">
                          {siteConfig.logoUrl ? (
                            <img src={siteConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: siteConfig.primaryColor }}>🚕</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors w-fit">
                            <Upload size={14} className="text-green-500" />
                            Subir logo (PNG, JPG, SVG)
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 2 * 1024 * 1024) { toast.error("El archivo debe ser menor a 2MB"); return; }
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const dataUrl = ev.target?.result as string;
                                  setSiteConfig(c => ({ ...c, logoUrl: dataUrl }));
                                  toast.success("Logo cargado. Haz clic en Guardar para aplicarlo.");
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <p className="text-xs text-slate-400 mt-1.5">Recomendado: 512×512px, fondo transparente (PNG)</p>
                          {siteConfig.logoUrl && (
                            <button onClick={() => setSiteConfig(c => ({ ...c, logoUrl: "" }))} className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1">
                              <XCircle size={11} /> Eliminar logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {[{ key: "siteTitle", label: "Título del sitio web", type: "text" }, { key: "tagline", label: "Subtítulo / Tagline", type: "text" }, { key: "heroTitle", label: "Título principal del Hero", type: "textarea" }, { key: "heroDesc", label: "Descripción del Hero", type: "textarea" }, { key: "ctaText", label: "Texto del botón CTA", type: "text" }].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                        {f.type === "textarea" ? <textarea value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" /> : <input type="text" value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />}
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div><p className="text-sm font-medium text-slate-900">Mostrar animaciones</p><p className="text-xs text-slate-500">Demo de 60 segundos en "Cómo funciona"</p></div>
                      <button onClick={() => setSiteConfig(c => ({ ...c, showAnimations: !c.showAnimations }))} className={`w-10 h-6 rounded-full transition-colors relative ${siteConfig.showAnimations ? "bg-green-500" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${siteConfig.showAnimations ? "translate-x-4" : "translate-x-0.5"}`} /></button>
                    </div>
                  </div>
                )}
                {editorSection === "colors" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Palette size={16} /> Colores y Tipografía</h3>
                    {[{ key: "primaryColor", label: "Color primario (verde WhatsApp)" }, { key: "secondaryColor", label: "Color secundario (fondo oscuro)" }, { key: "accentColor", label: "Color de acento" }].map(f => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                          <input type="text" value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipografía principal</label>
                      <select value={siteConfig.fontFamily} onChange={e => setSiteConfig(c => ({ ...c, fontFamily: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none">
                        {["Sora", "Inter", "Poppins", "Roboto", "Montserrat", "Nunito"].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <p className="text-xs text-slate-500 mb-2">Vista previa:</p>
                      <div className="flex gap-2">{[siteConfig.primaryColor, siteConfig.secondaryColor, siteConfig.accentColor].map((c, i) => <div key={i} className="w-10 h-10 rounded-lg shadow" style={{ background: c }} />)}</div>
                    </div>
                  </div>
                )}
                {editorSection === "contact" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Phone size={16} /> Información de Contacto</h3>
                    {[{ key: "contactEmail", label: "Email de soporte", type: "email" }, { key: "contactPhone", label: "Teléfono de contacto", type: "tel" }, { key: "contactAddress", label: "Dirección / Ciudad", type: "text" }].map(f => (
                      <div key={f.key}><label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label><input type={f.type} value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                    ))}
                  </div>
                )}
                {editorSection === "footer" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Layers size={16} /> Footer</h3>
                    {[{ key: "footerText", label: "Texto del footer (copyright)" }, { key: "footerLinks", label: "Links del footer (separados por |)" }].map(f => (
                      <div key={f.key}><label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label><input type="text" value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                    ))}
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <p className="text-white text-xs">{siteConfig.footerText}</p>
                      <div className="flex gap-3 mt-1">{siteConfig.footerLinks.split("|").map((l, i) => <span key={i} className="text-green-400 text-xs cursor-pointer hover:underline">{l.trim()}</span>)}</div>
                    </div>
                  </div>
                )}
                {editorSection === "meta" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Globe size={16} /> SEO y Meta Tags</h3>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Meta descripción</label><textarea value={siteConfig.metaDescription} onChange={e => setSiteConfig(c => ({ ...c, metaDescription: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Palabras clave</label><input type="text" value={siteConfig.metaKeywords} onChange={e => setSiteConfig(c => ({ ...c, metaKeywords: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-500 mb-2">Vista previa en Google:</p>
                      <p className="text-blue-600 text-sm font-medium">{siteConfig.siteTitle}</p>
                      <p className="text-green-700 text-xs">whatsapptaxi.com</p>
                      <p className="text-slate-600 text-xs mt-1">{siteConfig.metaDescription}</p>
                    </div>
                  </div>
                )}
                {editorSection === "features" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Sliders size={16} /> Funcionalidades del Sitio</h3>
                    {[{ key: "showPricing", label: "Mostrar sección de precios", desc: "Visible en el landing page" }, { key: "showTestimonials", label: "Mostrar testimonios", desc: "Sección de reseñas" }, { key: "showAnimations", label: "Demo animada (60 segundos)", desc: "Animación en 'Cómo funciona'" }, { key: "allowRegistration", label: "Permitir nuevos registros", desc: "Habilitar formulario de registro" }, { key: "requireEmailVerification", label: "Verificación de email", desc: "Confirmar email al registrarse" }, { key: "maintenanceMode", label: "Modo mantenimiento", desc: "Mostrar página de mantenimiento" }, { key: "surgePricing", label: "Tarifa dinámica activa", desc: "Precios variables por demanda" }].map(f => (
                      <div key={f.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div><p className="text-sm font-medium text-slate-900">{f.label}</p><p className="text-xs text-slate-500">{f.desc}</p></div>
                        <button onClick={() => setSiteConfig(c => ({ ...c, [f.key]: !(c as any)[f.key] }))} className={`w-10 h-6 rounded-full transition-colors relative ${(siteConfig as any)[f.key] ? "bg-green-500" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(siteConfig as any)[f.key] ? "translate-x-4" : "translate-x-0.5"}`} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {editorSection === "pricing" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><DollarSign size={16} /> Precios y Tarifas</h3>
                    {[{ key: "commissionRate", label: "Comisión de la plataforma (%)" }, { key: "basefare", label: "Tarifa base ($)" }, { key: "pricePerKm", label: "Precio por kilómetro ($)" }, { key: "surgeMultiplier", label: "Multiplicador de hora pico (×)" }].map(f => (
                      <div key={f.key}><label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label><input type="number" value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                    ))}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-sm font-semibold text-green-800 mb-2">Ejemplo de tarifa calculada:</p>
                      <p className="text-xs text-green-700">Viaje de 10 km = ${(parseFloat(siteConfig.basefare) + 10 * parseFloat(siteConfig.pricePerKm)).toFixed(2)} (tarifa normal)</p>
                      <p className="text-xs text-green-700">Con surge ×{siteConfig.surgeMultiplier} = ${((parseFloat(siteConfig.basefare) + 10 * parseFloat(siteConfig.pricePerKm)) * parseFloat(siteConfig.surgeMultiplier)).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </Card>
                {editorSection === "testimonials" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Star size={16} /> Testimonios de Clientes</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div><p className="text-sm font-medium text-slate-900">Mostrar testimonios en el landing</p><p className="text-xs text-slate-500">Activa para que sean visibles</p></div>
                      <button onClick={() => setSiteConfig(c => ({ ...c, showTestimonials: !c.showTestimonials }))} className={`w-10 h-6 rounded-full transition-colors relative ${siteConfig.showTestimonials ? "bg-green-500" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${siteConfig.showTestimonials ? "translate-x-4" : "translate-x-0.5"}`} /></button>
                    </div>
                    {((siteConfig as any).testimonials || []).map((t: any, idx: number) => (
                      <div key={t.id} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                        <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">Testimonio #{idx + 1}</p><button onClick={() => setSiteConfig(c => ({ ...c, testimonials: (c as any).testimonials.filter((_: any, i: number) => i !== idx) } as any))} className="text-red-400 hover:text-red-600"><XCircle size={16} /></button></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label><input type="text" value={t.name} onChange={e => { const ts = [...(siteConfig as any).testimonials]; ts[idx] = { ...ts[idx], name: e.target.value }; setSiteConfig(c => ({ ...c, testimonials: ts } as any)); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                          <div><label className="block text-xs font-medium text-slate-600 mb-1">Empresa</label><input type="text" value={t.company} onChange={e => { const ts = [...(siteConfig as any).testimonials]; ts[idx] = { ...ts[idx], company: e.target.value }; setSiteConfig(c => ({ ...c, testimonials: ts } as any)); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                        </div>
                        <div><label className="block text-xs font-medium text-slate-600 mb-1">Testimonio</label><textarea value={t.text} onChange={e => { const ts = [...(siteConfig as any).testimonials]; ts[idx] = { ...ts[idx], text: e.target.value }; setSiteConfig(c => ({ ...c, testimonials: ts } as any)); }} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" /></div>
                        <div><label className="block text-xs font-medium text-slate-600 mb-1">Calificación</label><div className="flex gap-1">{[1,2,3,4,5].map(star => <button key={star} onClick={() => { const ts = [...(siteConfig as any).testimonials]; ts[idx] = { ...ts[idx], rating: star }; setSiteConfig(c => ({ ...c, testimonials: ts } as any)); }} className={`text-xl transition-transform hover:scale-110 ${star <= t.rating ? "text-yellow-400" : "text-slate-300"}`}>★</button>)}</div></div>
                      </div>
                    ))}
                    <button onClick={() => setSiteConfig(c => ({ ...c, testimonials: [...((c as any).testimonials || []), { id: Date.now().toString(), name: "", company: "", text: "", rating: 5, avatarUrl: "" }] } as any))} className="w-full py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 text-sm font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2">+ Agregar testimonio</button>
                    {((siteConfig as any).testimonials || []).length === 0 && <div className="text-center py-8 text-slate-400"><Star size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No hay testimonios. Haz clic en "Agregar testimonio".</p></div>}
                  </div>
                )}
                {editorSection === "email" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Mail size={16} /> Configuración de Email</h3>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200"><p className="text-sm font-semibold text-blue-800 mb-1">📧 Email de notificaciones</p><p className="text-xs text-blue-600">Los mensajes del formulario de contacto y alertas llegarán a este correo.</p></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email donde recibirás los mensajes <span className="text-red-500">*</span></label><input type="email" value={(siteConfig as any).notificationEmail || ""} onChange={e => setSiteConfig(c => ({ ...c, notificationEmail: e.target.value } as any))} placeholder="tu@correo.com" className="w-full px-3 py-2.5 border-2 border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-sm font-semibold text-slate-800 mb-1">Configuración SMTP <span className="text-xs font-normal text-slate-400">(opcional)</span></p>
                      <p className="text-xs text-slate-500 mb-3">Si configuras SMTP, los emails se enviarán desde tu propio servidor. Si lo dejas vacío, se usará el servicio por defecto.</p>
                      {[{ key: "smtpHost", label: "Servidor SMTP", placeholder: "smtp.gmail.com" }, { key: "smtpPort", label: "Puerto", placeholder: "587" }, { key: "smtpUser", label: "Usuario SMTP", placeholder: "tu@gmail.com" }, { key: "smtpFrom", label: "Email remitente (From)", placeholder: "noreply@tudominio.com" }].map(f => (
                        <div key={f.key} className="mb-3"><label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label><input type="text" value={(siteConfig as any)[f.key] || ""} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value } as any))} placeholder={f.placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                      ))}
                      <div className="mb-3"><label className="block text-xs font-medium text-slate-600 mb-1">Contraseña SMTP</label><input type="password" value={(siteConfig as any).smtpPass || ""} onChange={e => setSiteConfig(c => ({ ...c, smtpPass: e.target.value } as any))} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200"><p className="text-xs text-amber-700"><strong>Gmail:</strong> Usa "Contraseña de aplicación". Ve a Google Account → Seguridad → Contraseñas de aplicación.</p></div>
                  </div>
                )}
            </div>
            )}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{ label: "Tasa de conversión", value: "68%", sub: "Solicitudes → Completados", color: "text-green-600" }, { label: "Tiempo promedio", value: "4.2 min", sub: "Espera hasta asignación", color: "text-blue-600" }, { label: "Ticket promedio", value: "$18.50", sub: "Por viaje completado", color: "text-purple-600" }, { label: "NPS Score", value: "4.7 ⭐", sub: "Satisfacción general", color: "text-yellow-600" }].map((s, i) => (
                  <Card key={i} className="p-4 text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-sm font-medium text-slate-700 mt-1">{s.label}</p><p className="text-xs text-slate-500">{s.sub}</p></Card>
                ))}
              </div>
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Tendencia Mensual</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip />
                    <Bar dataKey="viajes" fill="#25D366" radius={[4,4,0,0]} name="Viajes" />
                    <Bar dataKey="ingresos" fill="#3B82F6" radius={[4,4,0,0]} name="Ingresos $" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3">Top Conductores</h3>
                  {drivers.sort((a, b) => b.trips - a.trips).slice(0, 4).map((d, i) => (
                    <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">#{i+1}</span>
                      <div className="flex-1"><p className="text-sm font-medium text-slate-900">{d.name}</p><p className="text-xs text-slate-500">{d.trips} viajes · {d.earnings}</p></div>
                      <div className="flex items-center gap-0.5"><Star size={12} className="text-yellow-500 fill-yellow-500" /><span className="text-xs font-bold">{d.rating}</span></div>
                    </div>
                  ))}
                </Card>
                <Card className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-3">Top Clientes</h3>
                  {clients.sort((a, b) => b.trips - a.trips).slice(0, 4).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">#{i+1}</span>
                      <div className="flex-1"><p className="text-sm font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.trips} viajes · {c.spent}</p></div>
                      <div className="flex items-center gap-0.5"><Star size={12} className="text-yellow-500 fill-yellow-500" /><span className="text-xs font-bold">{c.rating}</span></div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Configuración General</h3>
                {[{ key: "siteTitle", label: "Nombre del sitio web", type: "text" }, { key: "contactEmail", label: "Email de soporte", type: "email" }, { key: "contactPhone", label: "Teléfono de contacto", type: "tel" }, { key: "commissionRate", label: "Comisión de la plataforma (%)", type: "number" }].map(f => (
                  <Card key={f.key} className="p-4"><label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label><input type={f.type} value={(siteConfig as any)[f.key]} onChange={e => setSiteConfig(c => ({ ...c, [f.key]: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></Card>
                ))}
                <Button onClick={handleSaveConfig} className="w-full bg-green-500 hover:bg-green-600 text-white gap-2"><Save size={15} /> Guardar configuración</Button>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Acceso y Seguridad</h3>
                {[{ key: "allowRegistration", label: "Permitir nuevos registros", desc: "Usuarios pueden crear cuentas" }, { key: "requireEmailVerification", label: "Verificación de email", desc: "Confirmar email al registrarse" }, { key: "maintenanceMode", label: "Modo mantenimiento", desc: "Mostrar página de mantenimiento" }, { key: "surgePricing", label: "Tarifa dinámica activa", desc: "Precios variables por demanda" }].map(f => (
                  <Card key={f.key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-medium text-slate-900">{f.label}</p><p className="text-xs text-slate-500">{f.desc}</p></div>
                      <button onClick={() => setSiteConfig(c => ({ ...c, [f.key]: !(c as any)[f.key] }))} className={`w-10 h-6 rounded-full transition-colors relative ${(siteConfig as any)[f.key] ? "bg-green-500" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(siteConfig as any)[f.key] ? "translate-x-4" : "translate-x-0.5"}`} /></button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal permisos conductor */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingDriver(null)}>
          <Card className="w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-slate-900">Permisos — {editingDriver.name}</h2>
              <button onClick={() => setEditingDriver(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[{ key: "canAcceptTrips" as const, label: "Aceptar viajes", icon: Navigation }, { key: "canViewClientPhone" as const, label: "Ver teléfono del cliente", icon: Phone }, { key: "canSetOwnFare" as const, label: "Establecer tarifa propia", icon: DollarSign }, { key: "canCancelTrip" as const, label: "Cancelar viajes", icon: XCircle }].map(perm => (
                <div key={perm.key} className={`flex items-center justify-between p-3 rounded-xl border ${editingDriver.permissions[perm.key] ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editingDriver.permissions[perm.key] ? "bg-green-500" : "bg-slate-300"}`}><perm.icon size={14} className="text-white" /></div>
                    <p className="text-sm font-medium text-slate-900">{perm.label}</p>
                  </div>
                  <button onClick={() => { handlePermissionToggle(editingDriver.id, perm.key); setEditingDriver(d => d ? { ...d, permissions: { ...d.permissions, [perm.key]: !d.permissions[perm.key] } } : null); }} className={`w-10 h-6 rounded-full transition-colors relative ${editingDriver.permissions[perm.key] ? "bg-green-500" : "bg-slate-300"}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editingDriver.permissions[perm.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={() => setEditingDriver(null)} className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">Cerrar</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
