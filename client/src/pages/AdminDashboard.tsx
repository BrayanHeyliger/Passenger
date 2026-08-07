import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Car, MapPin, DollarSign, BarChart3, Settings, LogOut, Eye, Ban, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

type Tab = "overview" | "clients" | "drivers" | "trips" | "payments" | "settings";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const stats = [
    { label: "Clientes Activos", value: "1,247", icon: Users, color: "bg-blue-500" },
    { label: "Conductores", value: "89", icon: Car, color: "bg-green-500" },
    { label: "Viajes Hoy", value: "342", icon: MapPin, color: "bg-purple-500" },
    { label: "Ingresos Hoy", value: "$12,450", icon: DollarSign, color: "bg-yellow-500" },
  ];

  const recentTrips = [
    { id: 1, client: "María García", driver: "Carlos M.", from: "Centro", to: "Aeropuerto", fare: "$42.00", status: "completed" },
    { id: 2, client: "Juan López", driver: "Pedro R.", from: "Estación", to: "Hotel", fare: "$18.50", status: "in_progress" },
    { id: 3, client: "Ana Martínez", driver: "Luis S.", from: "Mall", to: "Residencial", fare: "$25.00", status: "requested" },
    { id: 4, client: "Roberto Díaz", driver: "Miguel A.", from: "Hospital", to: "Centro", fare: "$15.00", status: "completed" },
    { id: 5, client: "Laura Pérez", driver: "---", from: "Universidad", to: "Parque", fare: "$12.00", status: "cancelled" },
  ];

  const drivers = [
    { id: 1, name: "Carlos Mendoza", phone: "+1 555-0101", vehicle: "Toyota Corolla", plate: "ABC-123", status: "active", rating: 4.8, trips: 156 },
    { id: 2, name: "Pedro Ramírez", phone: "+1 555-0102", vehicle: "Honda Civic", plate: "DEF-456", status: "active", rating: 4.6, trips: 89 },
    { id: 3, name: "Luis Sánchez", phone: "+1 555-0103", vehicle: "Nissan Sentra", plate: "GHI-789", status: "inactive", rating: 4.9, trips: 234 },
    { id: 4, name: "Miguel Ángel", phone: "+1 555-0104", vehicle: "Chevrolet Aveo", plate: "JKL-012", status: "pending", rating: 0, trips: 0 },
  ];

  const clients_list = [
    { id: 1, name: "María García", email: "maria@email.com", phone: "+1 555-1001", trips: 45, rating: 4.9, status: "active" },
    { id: 2, name: "Juan López", email: "juan@email.com", phone: "+1 555-1002", trips: 23, rating: 4.7, status: "active" },
    { id: 3, name: "Ana Martínez", email: "ana@email.com", phone: "+1 555-1003", trips: 12, rating: 4.5, status: "active" },
    { id: 4, name: "Roberto Díaz", email: "roberto@email.com", phone: "+1 555-1004", trips: 67, rating: 4.8, status: "suspended" },
  ];

  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    requested: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
  };

  const tabs = [
    { id: "overview" as Tab, label: "Resumen", icon: BarChart3 },
    { id: "clients" as Tab, label: "Clientes", icon: Users },
    { id: "drivers" as Tab, label: "Conductores", icon: Car },
    { id: "trips" as Tab, label: "Viajes", icon: MapPin },
    { id: "payments" as Tab, label: "Pagos", icon: DollarSign },
    { id: "settings" as Tab, label: "Configuración", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
              <img src="/manus-storage/logo-icon_34950e08.png" alt="Logo" className="w-full h-full object-cover" style={{ background: "oklch(0.76 0.18 148)" }} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">WhatsApp Taxi</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">H</div>
            <div>
              <p className="text-sm font-medium text-slate-900">Heyliger</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate("/")}>
            <LogOut size={14} /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Trips */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Viajes Recientes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">ID</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Cliente</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Conductor</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Origen</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Destino</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Tarifa</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 font-mono text-slate-600">#{trip.id}</td>
                        <td className="py-3 px-2 text-slate-900">{trip.client}</td>
                        <td className="py-3 px-2 text-slate-900">{trip.driver}</td>
                        <td className="py-3 px-2 text-slate-600">{trip.from}</td>
                        <td className="py-3 px-2 text-slate-600">{trip.to}</td>
                        <td className="py-3 px-2 font-semibold text-slate-900">{trip.fare}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
                            {trip.status === "completed" ? "Completado" : trip.status === "in_progress" ? "En progreso" : trip.status === "requested" ? "Solicitado" : "Cancelado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Clientes</h1>
              <p className="text-sm text-slate-500">{clients_list.length} clientes registrados</p>
            </div>
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Nombre</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Email</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Teléfono</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Viajes</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Rating</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Estado</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients_list.map((client) => (
                      <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 font-medium text-slate-900">{client.name}</td>
                        <td className="py-3 px-2 text-slate-600">{client.email}</td>
                        <td className="py-3 px-2 text-slate-600">{client.phone}</td>
                        <td className="py-3 px-2 text-slate-900">{client.trips}</td>
                        <td className="py-3 px-2 text-slate-900">⭐ {client.rating}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                            {client.status === "active" ? "Activo" : "Suspendido"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500"><Eye size={14} /></button>
                            <button className="p-1.5 rounded hover:bg-red-100 text-red-500"><Ban size={14} /></button>
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

        {/* Drivers Tab */}
        {activeTab === "drivers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Conductores</h1>
              <p className="text-sm text-slate-500">{drivers.length} conductores registrados</p>
            </div>
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Nombre</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Teléfono</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Vehículo</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Placa</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Viajes</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Rating</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Estado</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 font-medium text-slate-900">{driver.name}</td>
                        <td className="py-3 px-2 text-slate-600">{driver.phone}</td>
                        <td className="py-3 px-2 text-slate-600">{driver.vehicle}</td>
                        <td className="py-3 px-2 font-mono text-slate-600">{driver.plate}</td>
                        <td className="py-3 px-2 text-slate-900">{driver.trips}</td>
                        <td className="py-3 px-2 text-slate-900">{driver.rating > 0 ? `⭐ ${driver.rating}` : "N/A"}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[driver.status]}`}>
                            {driver.status === "active" ? "Activo" : driver.status === "pending" ? "Pendiente" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded hover:bg-green-100 text-green-500"><CheckCircle size={14} /></button>
                            <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500"><Eye size={14} /></button>
                            <button className="p-1.5 rounded hover:bg-red-100 text-red-500"><Ban size={14} /></button>
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

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Monitor de Viajes</h1>
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">ID</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Cliente</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Conductor</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Origen</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Destino</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Tarifa</th>
                      <th className="text-left py-3 px-2 text-slate-500 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 font-mono text-slate-600">#{trip.id}</td>
                        <td className="py-3 px-2 text-slate-900">{trip.client}</td>
                        <td className="py-3 px-2 text-slate-900">{trip.driver}</td>
                        <td className="py-3 px-2 text-slate-600">{trip.from}</td>
                        <td className="py-3 px-2 text-slate-600">{trip.to}</td>
                        <td className="py-3 px-2 font-semibold text-slate-900">{trip.fare}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
                            {trip.status === "completed" ? "Completado" : trip.status === "in_progress" ? "En progreso" : trip.status === "requested" ? "Solicitado" : "Cancelado"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Pagos</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <p className="text-sm text-slate-500">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">$45,230</p>
                <p className="text-sm text-green-600 mt-1">+12% vs mes anterior</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-slate-500">Comisiones Ganadas</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">$6,784</p>
                <p className="text-sm text-slate-500 mt-1">15% promedio</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm text-slate-500">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">$2,150</p>
                <p className="text-sm text-yellow-600 mt-1">8 transacciones</p>
              </Card>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Cuenta Super Admin</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Usuario</span>
                  <span className="font-medium text-slate-900">Heyliger</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-900">admin@whatsapptaxi.com</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Rol</span>
                  <span className="font-medium text-green-600">Super Administrador</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
