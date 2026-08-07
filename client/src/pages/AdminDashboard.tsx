import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users, Car, MapPin, DollarSign, BarChart3, Settings, LogOut, Eye, Ban, CheckCircle,
  TrendingUp, AlertTriangle, Star, Download, RefreshCw, Bell, Shield, Globe, Zap
} from "lucide-react";
import { useLocation } from "wouter";
import { MapView } from "@/components/Map";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

type Tab = "overview" | "godsEye" | "clients" | "drivers" | "trips" | "payments" | "analytics" | "settings";

const revenueData = [
  { day: "Lun", revenue: 1200, trips: 48 },
  { day: "Mar", revenue: 1850, trips: 74 },
  { day: "Mié", revenue: 1400, trips: 56 },
  { day: "Jue", revenue: 2100, trips: 84 },
  { day: "Vie", revenue: 2800, trips: 112 },
  { day: "Sáb", revenue: 3200, trips: 128 },
  { day: "Dom", revenue: 2400, trips: 96 },
];

const vehicleData = [
  { name: "Económico", value: 45, color: "#25D366" },
  { name: "Confort", value: 30, color: "#3B82F6" },
  { name: "Premium", value: 15, color: "#8B5CF6" },
  { name: "SUV", value: 10, color: "#F59E0B" },
];

const mockDrivers = [
  { id: 1, name: "Carlos Mendoza", phone: "+1 555-0101", vehicle: "Toyota Corolla", plate: "ABC-123", status: "active", rating: 4.8, trips: 156, lat: 19.44, lng: -99.14 },
  { id: 2, name: "Pedro Ramírez", phone: "+1 555-0102", vehicle: "Honda Civic", plate: "DEF-456", status: "on_trip", rating: 4.6, trips: 89, lat: 19.43, lng: -99.13 },
  { id: 3, name: "Luis Sánchez", phone: "+1 555-0103", vehicle: "Nissan Sentra", plate: "GHI-789", status: "active", rating: 4.9, trips: 234, lat: 19.45, lng: -99.15 },
  { id: 4, name: "Miguel Ángel", phone: "+1 555-0104", vehicle: "Chevrolet Aveo", plate: "JKL-012", status: "pending", rating: 0, trips: 0, lat: 19.42, lng: -99.12 },
  { id: 5, name: "Roberto Cruz", phone: "+1 555-0105", vehicle: "Kia Rio", plate: "MNO-345", status: "inactive", rating: 4.3, trips: 67, lat: 19.46, lng: -99.16 },
];

const mockClients = [
  { id: 1, name: "María García", email: "maria@email.com", phone: "+1 555-1001", trips: 45, rating: 4.9, status: "active", spent: "$892" },
  { id: 2, name: "Juan López", email: "juan@email.com", phone: "+1 555-1002", trips: 23, rating: 4.7, status: "active", spent: "$456" },
  { id: 3, name: "Ana Martínez", email: "ana@email.com", phone: "+1 555-1003", trips: 12, rating: 4.5, status: "active", spent: "$234" },
  { id: 4, name: "Roberto Díaz", email: "roberto@email.com", phone: "+1 555-1004", trips: 67, rating: 4.8, status: "suspended", spent: "$1,340" },
  { id: 5, name: "Laura Pérez", email: "laura@email.com", phone: "+1 555-1005", trips: 8, rating: 4.2, status: "active", spent: "$160" },
];

const mockTrips = [
  { id: 1, client: "María García", driver: "Carlos M.", from: "Centro", to: "Aeropuerto", fare: "$42.00", status: "completed", time: "10:32" },
  { id: 2, client: "Juan López", driver: "Pedro R.", from: "Estación", to: "Hotel", fare: "$18.50", status: "in_progress", time: "10:45" },
  { id: 3, client: "Ana Martínez", driver: "Luis S.", from: "Mall", to: "Residencial", fare: "$25.00", status: "requested", time: "10:51" },
  { id: 4, client: "Roberto Díaz", driver: "Miguel A.", from: "Hospital", to: "Centro", fare: "$15.00", status: "completed", time: "09:15" },
  { id: 5, client: "Laura Pérez", driver: "---", from: "Universidad", to: "Parque", fare: "$12.00", status: "cancelled", time: "09:30" },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  requested: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  on_trip: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  completed: "Completado", in_progress: "En progreso", requested: "Solicitado",
  cancelled: "Cancelado", active: "Activo", on_trip: "En viaje",
  inactive: "Inactivo", pending: "Pendiente", suspended: "Suspendido",
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // Place driver markers
    mockDrivers.forEach(driver => {
      const colors: Record<string, string> = { active: "#25D366", on_trip: "#3B82F6", inactive: "#9CA3AF", pending: "#F59E0B" };
      const el = document.createElement("div");
      el.style.cssText = `width:36px;height:36px;border-radius:50%;background:${colors[driver.status] || "#9CA3AF"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:13px;cursor:pointer;`;
      el.textContent = driver.name[0];
      el.title = `${driver.name} — ${statusLabels[driver.status]}`;
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: driver.lat, lng: driver.lng },
        content: el,
        title: driver.name,
      });
      markersRef.current.push(marker);
    });
  }, []);

  const tabs = [
    { id: "overview" as Tab, label: "Resumen", icon: BarChart3 },
    { id: "godsEye" as Tab, label: "God's Eye", icon: Eye },
    { id: "clients" as Tab, label: "Clientes", icon: Users },
    { id: "drivers" as Tab, label: "Conductores", icon: Car },
    { id: "trips" as Tab, label: "Viajes", icon: MapPin },
    { id: "payments" as Tab, label: "Pagos", icon: DollarSign },
    { id: "analytics" as Tab, label: "Analytics", icon: TrendingUp },
    { id: "settings" as Tab, label: "Config", icon: Settings },
  ];

  const stats = [
    { label: "Clientes Activos", value: "1,247", icon: Users, color: "bg-blue-500", change: "+12%" },
    { label: "Conductores", value: "89", icon: Car, color: "bg-green-500", change: "+5%" },
    { label: "Viajes Hoy", value: "342", icon: MapPin, color: "bg-purple-500", change: "+18%" },
    { label: "Ingresos Hoy", value: "$12,450", icon: DollarSign, color: "bg-yellow-500", change: "+22%" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow">WT</div>
            <div>
              <p className="font-bold text-slate-900 text-sm">WhatsApp Taxi</p>
              <p className="text-xs text-green-600 font-medium">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-green-50 text-green-700 font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={17} />
              {tab.label}
              {tab.id === "godsEye" && <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">H</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Heyliger</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => navigate("/")}>
            <LogOut size={13} /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 p-6 overflow-auto">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2"><RefreshCw size={14} /> Actualizar</Button>
                <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Exportar</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4">Ingresos de la Semana</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`$${v}`, "Ingresos"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#25D366" strokeWidth={2.5} dot={{ fill: "#25D366", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4">Viajes por Día</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="trips" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">Viajes Recientes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-200">
                    {["ID","Cliente","Conductor","Origen","Destino","Tarifa","Hora","Estado"].map(h => (
                      <th key={h} className="text-left py-2.5 px-2 text-slate-500 font-medium text-xs">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {mockTrips.map(t => (
                      <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-mono text-slate-500 text-xs">#{t.id}</td>
                        <td className="py-2.5 px-2 text-slate-900">{t.client}</td>
                        <td className="py-2.5 px-2 text-slate-600">{t.driver}</td>
                        <td className="py-2.5 px-2 text-slate-600">{t.from}</td>
                        <td className="py-2.5 px-2 text-slate-600">{t.to}</td>
                        <td className="py-2.5 px-2 font-semibold text-slate-900">{t.fare}</td>
                        <td className="py-2.5 px-2 text-slate-500 text-xs">{t.time}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* GOD'S EYE */}
        {activeTab === "godsEye" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">God's Eye — Mapa en Tiempo Real</h1>
                <p className="text-sm text-slate-500 mt-1">Visualiza todos los conductores activos en tiempo real</p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Disponible ({mockDrivers.filter(d => d.status === "active").length})</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span>En viaje ({mockDrivers.filter(d => d.status === "on_trip").length})</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-400" /><span>Inactivo ({mockDrivers.filter(d => d.status === "inactive").length})</span></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <Card className="overflow-hidden" style={{ height: "500px", position: "relative" }}>
                  <MapView
                    initialCenter={{ lat: 19.4326, lng: -99.1332 }}
                    initialZoom={13}
                    onMapReady={handleMapReady}
                    className="absolute inset-0 w-full h-full"
                  />
                </Card>
              </div>
              <div className="space-y-3">
                <Card className="p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3">Conductores Activos</h3>
                  <div className="space-y-2">
                    {mockDrivers.map(d => (
                      <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${d.status === "active" ? "bg-green-500" : d.status === "on_trip" ? "bg-blue-500" : d.status === "pending" ? "bg-yellow-500" : "bg-gray-400"}`}>
                          {d.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{d.name}</p>
                          <p className="text-xs text-slate-500">{d.plate}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[d.status]}`}>{statusLabels[d.status]}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Clientes</h1>
              <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Exportar CSV</Button>
            </div>
            <Card className="p-5">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200">
                  {["Nombre","Email","Teléfono","Viajes","Rating","Gastado","Estado","Acciones"].map(h => (
                    <th key={h} className="text-left py-2.5 px-2 text-slate-500 font-medium text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {mockClients.map(c => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-900">{c.name}</td>
                      <td className="py-3 px-2 text-slate-600 text-xs">{c.email}</td>
                      <td className="py-3 px-2 text-slate-600">{c.phone}</td>
                      <td className="py-3 px-2 text-slate-900">{c.trips}</td>
                      <td className="py-3 px-2"><span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" />{c.rating}</span></td>
                      <td className="py-3 px-2 font-semibold text-green-600">{c.spent}</td>
                      <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{statusLabels[c.status]}</span></td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500"><Eye size={13} /></button>
                          <button className="p-1.5 rounded hover:bg-red-100 text-red-500"><Ban size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* DRIVERS */}
        {activeTab === "drivers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Conductores</h1>
              <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Exportar CSV</Button>
            </div>
            <Card className="p-5">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200">
                  {["Conductor","Teléfono","Vehículo","Placa","Viajes","Rating","Estado","Acciones"].map(h => (
                    <th key={h} className="text-left py-2.5 px-2 text-slate-500 font-medium text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {mockDrivers.map(d => (
                    <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-900">{d.name}</td>
                      <td className="py-3 px-2 text-slate-600">{d.phone}</td>
                      <td className="py-3 px-2 text-slate-600">{d.vehicle}</td>
                      <td className="py-3 px-2 font-mono text-slate-600 text-xs">{d.plate}</td>
                      <td className="py-3 px-2 text-slate-900">{d.trips}</td>
                      <td className="py-3 px-2">{d.rating > 0 ? <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" />{d.rating}</span> : "N/A"}</td>
                      <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status]}`}>{statusLabels[d.status]}</span></td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded hover:bg-green-100 text-green-500"><CheckCircle size={13} /></button>
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500"><Eye size={13} /></button>
                          <button className="p-1.5 rounded hover:bg-red-100 text-red-500"><Ban size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TRIPS */}
        {activeTab === "trips" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Monitor de Viajes</h1>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Completados", value: "289", color: "text-green-600", bg: "bg-green-50" },
                { label: "En Progreso", value: "12", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Solicitados", value: "8", color: "text-yellow-600", bg: "bg-yellow-50" },
                { label: "Cancelados", value: "33", color: "text-red-600", bg: "bg-red-50" },
              ].map(s => (
                <Card key={s.label} className={`p-4 ${s.bg}`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{s.label}</p>
                </Card>
              ))}
            </div>
            <Card className="p-5">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200">
                  {["ID","Cliente","Conductor","Origen","Destino","Tarifa","Hora","Estado"].map(h => (
                    <th key={h} className="text-left py-2.5 px-2 text-slate-500 font-medium text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {mockTrips.map(t => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 px-2 font-mono text-slate-500 text-xs">#{t.id}</td>
                      <td className="py-2.5 px-2 text-slate-900">{t.client}</td>
                      <td className="py-2.5 px-2 text-slate-600">{t.driver}</td>
                      <td className="py-2.5 px-2 text-slate-600">{t.from}</td>
                      <td className="py-2.5 px-2 text-slate-600">{t.to}</td>
                      <td className="py-2.5 px-2 font-semibold">{t.fare}</td>
                      <td className="py-2.5 px-2 text-slate-500 text-xs">{t.time}</td>
                      <td className="py-2.5 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status]}`}>{statusLabels[t.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* PAYMENTS */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Pagos</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5"><p className="text-sm text-slate-500">Ingresos del Mes</p><p className="text-3xl font-bold text-slate-900 mt-1">$45,230</p><p className="text-sm text-green-600 mt-1">+12% vs mes anterior</p></Card>
              <Card className="p-5"><p className="text-sm text-slate-500">Comisiones</p><p className="text-3xl font-bold text-slate-900 mt-1">$6,784</p><p className="text-sm text-slate-500 mt-1">15% promedio</p></Card>
              <Card className="p-5"><p className="text-sm text-slate-500">Pagos Pendientes</p><p className="text-3xl font-bold text-slate-900 mt-1">$2,150</p><p className="text-sm text-yellow-600 mt-1">8 transacciones</p></Card>
            </div>
            <Card className="p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4">Métodos de Pago Configurados</h2>
              <div className="space-y-3">
                {[
                  { name: "Stripe", status: "active", icon: "💳", desc: "Tarjetas de crédito/débito" },
                  { name: "PayPal", status: "active", icon: "🅿️", desc: "Pagos con cuenta PayPal" },
                  { name: "Efectivo", status: "active", icon: "💵", desc: "Pago en efectivo al conductor" },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div><p className="font-medium text-slate-900">{m.name}</p><p className="text-xs text-slate-500">{m.desc}</p></div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Activo</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Analytics Avanzado</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4">Distribución por Tipo de Vehículo</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={vehicleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {vehicleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4">Ingresos vs Viajes (Semana)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#25D366" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
                    <Bar dataKey="trips" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Viajes" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4"><p className="text-sm text-slate-500">Tiempo Promedio de Espera</p><p className="text-2xl font-bold text-slate-900 mt-1">4.2 min</p><p className="text-xs text-green-600">-0.8 min vs semana anterior</p></Card>
              <Card className="p-4"><p className="text-sm text-slate-500">Tasa de Cancelación</p><p className="text-2xl font-bold text-slate-900 mt-1">9.6%</p><p className="text-xs text-red-500">+1.2% vs semana anterior</p></Card>
              <Card className="p-4"><p className="text-sm text-slate-500">Calificación Promedio</p><p className="text-2xl font-bold text-slate-900 mt-1">4.7 ⭐</p><p className="text-xs text-green-600">+0.1 vs semana anterior</p></Card>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Configuración del Sistema</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-green-600" /> Cuenta Super Admin</h2>
                <div className="space-y-3 text-sm">
                  {[["Usuario","Heyliger"],["Email","admin@whatsapptaxi.com"],["Rol","Super Administrador"],["Último acceso","Hoy, 10:32 AM"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">{k}</span>
                      <span className={`font-medium ${k === "Rol" ? "text-green-600" : "text-slate-900"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-600" /> Configuración Global</h2>
                <div className="space-y-3 text-sm">
                  {[["Proveedor de Mapas","Google Maps"],["Moneda","USD ($)"],["Zona Horaria","America/Mexico_City"],["Idioma","Español"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-600" /> Pricing Dinámico</h2>
                <div className="space-y-3 text-sm">
                  {[["Surge Pricing","Activado"],["Multiplicador Máx.","3.0x"],["Umbral de Activación","80% demanda"],["Horario Nocturno","1.5x (22:00-06:00)"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Bell size={18} className="text-purple-600" /> Notificaciones</h2>
                <div className="space-y-3 text-sm">
                  {[["WhatsApp Bot","Activo"],["Email","Activo"],["SMS Backup","Inactivo"],["Push Notifications","Activo"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">{k}</span>
                      <span className={`font-medium ${v === "Activo" ? "text-green-600" : "text-slate-400"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
