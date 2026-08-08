/**
 * DispatcherDashboard — Panel del Despachador
 * Permisos granulares configurados por el Super Admin
 * Puede asignar viajes, ver mapa, contactar usuarios
 * NO puede ver finanzas, editar precios ni la plantilla
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin, Phone, MessageCircle, LogOut, CheckCircle, Bell,
  Car, Navigation, Users, Clock, AlertTriangle, Radio,
  Eye, Send, User, XCircle, Activity
} from "lucide-react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { trpc } from "@/lib/trpc";
import LeafletMap from "@/components/LeafletMap";
import { toast } from "sonner";

// Default permissions if not loaded from DB
const DEFAULT_PERMISSIONS = {
  viewMap: true,
  assignTrips: true,
  viewDrivers: true,
  contactUsers: true,
  viewTripHistory: true,
  cancelTrips: false,
  viewFinancials: false,
  editPrices: false,
  editSite: false,
};

const TRIPS_KEY = "wt_pending_trips";

interface MockDriver {
  id: string; name: string; vehicle: string; plate: string;
  status: "available" | "busy" | "offline"; lat: number; lng: number; trips: number;
}

const MOCK_DRIVERS: MockDriver[] = [
  { id: "d1", name: "Carlos M.", vehicle: "Toyota Corolla", plate: "ABC-123", status: "available", lat: 19.4326, lng: -99.1332, trips: 8 },
  { id: "d2", name: "Luis R.", vehicle: "Honda Civic", plate: "XYZ-456", status: "available", lat: 19.4400, lng: -99.1450, trips: 5 },
  { id: "d3", name: "Ana G.", vehicle: "Nissan Versa", plate: "DEF-789", status: "busy", lat: 19.4250, lng: -99.1200, trips: 12 },
  { id: "d4", name: "Pedro S.", vehicle: "VW Jetta", plate: "GHI-012", status: "offline", lat: 19.4500, lng: -99.1600, trips: 3 },
];

export default function DispatcherDashboard() {
  const { user, isAuthenticated, logout } = useLocalAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"queue" | "map" | "drivers" | "history">("queue");
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [pendingTrips, setPendingTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated]);

  // Load pending trips
  useEffect(() => {
    const load = () => {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      setPendingTrips(trips.filter((t: any) => t.status === "requested"));
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const logActivity = (msg: string) => {
    setActivityLog(prev => [`${new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} — ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleAssignTrip = () => {
    if (!selectedTrip || !selectedDriver) { toast.error("Selecciona un conductor"); return; }
    const driver = MOCK_DRIVERS.find(d => d.id === selectedDriver);
    if (!driver) return;

    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    const updated = trips.map((t: any) =>
      t.id === selectedTrip.id
        ? { ...t, status: "accepted", driver: { name: driver.name, vehicle: driver.vehicle, plate: driver.plate, rating: 4.8, phone: "+15550101" }, estimatedTime: "5 min" }
        : t
    );
    localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
    logActivity(`Asignado viaje a ${driver.name}: ${selectedTrip.pickup} → ${selectedTrip.dropoff}`);
    toast.success(`Viaje asignado a ${driver.name}`);
    setShowAssignModal(false);
    setSelectedTrip(null);
    setSelectedDriver("");
  };

  const handleCancelTrip = (tripId: string) => {
    if (!permissions.cancelTrips) { toast.error("No tienes permiso para cancelar viajes"); return; }
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips.filter((t: any) => t.id !== tripId)));
    logActivity(`Viaje cancelado: ${tripId}`);
    toast.success("Viaje cancelado");
  };

  const availableDrivers = MOCK_DRIVERS.filter(d => d.status === "available");
  const busyDrivers = MOCK_DRIVERS.filter(d => d.status === "busy");

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
            {user?.name?.[0] || "D"}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-slate-400">Despachador · En línea</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            {pendingTrips.length > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                {pendingTrips.length} viajes pendientes
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}
            className="gap-1.5 text-xs border-slate-600 text-slate-300 hover:bg-slate-800">
            <LogOut size={13} /> Salir
          </Button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex gap-4 overflow-x-auto">
        {[
          { label: "Pendientes", value: pendingTrips.length, color: "text-red-600", bg: "bg-red-50" },
          { label: "Disponibles", value: availableDrivers.length, color: "text-green-600", bg: "bg-green-50" },
          { label: "En viaje", value: busyDrivers.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total conductores", value: MOCK_DRIVERS.length, color: "text-slate-600", bg: "bg-slate-50" },
        ].map(stat => (
          <div key={stat.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${stat.bg} flex-shrink-0`}>
            <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-slate-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex">
          {[
            { id: "queue" as const, label: "Cola de Viajes", icon: Radio, show: true },
            { id: "map" as const, label: "Mapa", icon: MapPin, show: permissions.viewMap },
            { id: "drivers" as const, label: "Conductores", icon: Car, show: permissions.viewDrivers },
            { id: "history" as const, label: "Actividad", icon: Activity, show: permissions.viewTripHistory },
          ].filter(t => t.show).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-5 w-full">

        {/* TAB: COLA DE VIAJES */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Viajes Pendientes de Asignación</h2>
              <span className="text-sm text-slate-500">{pendingTrips.length} en cola</span>
            </div>

            {pendingTrips.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                <p className="text-slate-500 font-medium">No hay viajes pendientes</p>
                <p className="text-sm text-slate-400 mt-1">Los nuevos viajes aparecerán aquí automáticamente</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTrips.map((trip: any) => (
                  <Card key={trip.id} className="p-4 border-l-4 border-l-orange-400">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{trip.clientName || "Cliente"}</p>
                        <p className="text-xs text-slate-500">{new Date(trip.requestedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{trip.fare}</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-slate-700 leading-snug">{trip.pickup}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-slate-700 leading-snug">{trip.dropoff}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {permissions.assignTrips && (
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
                          onClick={() => { setSelectedTrip(trip); setShowAssignModal(true); }}>
                          <Send size={12} /> Asignar
                        </Button>
                      )}
                      {permissions.cancelTrips && (
                        <Button size="sm" variant="outline" className="text-xs text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancelTrip(trip.id)}>
                          <XCircle size={12} />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: MAPA */}
        {activeTab === "map" && permissions.viewMap && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Vista en Tiempo Real</h2>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: "500px" }}>
              <LeafletMap height="500px" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOCK_DRIVERS.map(driver => (
                <Card key={driver.id} className={`p-3 border-l-4 ${driver.status === "available" ? "border-l-green-500" : driver.status === "busy" ? "border-l-blue-500" : "border-l-slate-300"}`}>
                  <p className="font-semibold text-sm text-slate-900">{driver.name}</p>
                  <p className="text-xs text-slate-500">{driver.vehicle}</p>
                  <span className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${driver.status === "available" ? "bg-green-100 text-green-700" : driver.status === "busy" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    {driver.status === "available" ? "Disponible" : driver.status === "busy" ? "En viaje" : "Desconectado"}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CONDUCTORES */}
        {activeTab === "drivers" && permissions.viewDrivers && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Conductores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_DRIVERS.map(driver => (
                <Card key={driver.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${driver.status === "available" ? "bg-green-500" : driver.status === "busy" ? "bg-blue-500" : "bg-slate-400"}`}>
                      {driver.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{driver.name}</p>
                      <p className="text-xs text-slate-500">{driver.vehicle} · {driver.plate}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${driver.status === "available" ? "bg-green-100 text-green-700" : driver.status === "busy" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {driver.status === "available" ? "● Disponible" : driver.status === "busy" ? "● En viaje" : "○ Offline"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>Viajes hoy: <strong className="text-slate-800">{driver.trips}</strong></span>
                  </div>
                  {permissions.contactUsers && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs"
                        onClick={() => window.location.href = `tel:+15550101`}>
                        <Phone size={12} /> Llamar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs"
                        onClick={() => window.open(`https://wa.me/15550101`, "_blank")}>
                        <MessageCircle size={12} /> WhatsApp
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ACTIVIDAD */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Registro de Actividad</h2>
            {activityLog.length === 0 ? (
              <Card className="p-6 text-center">
                <Activity size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Sin actividad registrada aún</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{log}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de asignación */}
      {showAssignModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Asignar Conductor</h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-sm font-medium text-slate-700">Viaje: {selectedTrip.pickup} → {selectedTrip.dropoff}</p>
              <p className="text-sm text-green-600 font-bold">{selectedTrip.fare}</p>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-slate-700">Seleccionar conductor disponible:</p>
              {availableDrivers.map(driver => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedDriver === driver.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {driver.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{driver.name}</p>
                    <p className="text-xs text-slate-500">{driver.vehicle} · {driver.trips} viajes hoy</p>
                  </div>
                  {selectedDriver === driver.id && <CheckCircle size={18} className="text-blue-500 ml-auto" />}
                </button>
              ))}
              {availableDrivers.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-3">No hay conductores disponibles</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowAssignModal(false); setSelectedDriver(""); }}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAssignTrip} disabled={!selectedDriver}>
                Confirmar Asignación
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
