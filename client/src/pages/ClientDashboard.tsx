import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Star, Clock, DollarSign, LogOut, CheckCircle, AlertCircle, Bell } from "lucide-react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";

type TripStatus = "idle" | "requesting" | "searching" | "accepted" | "in_progress" | "completed";

interface TripNotification {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
}

const TRIPS_KEY = "wt_pending_trips";
const NOTIFICATIONS_KEY = "wt_client_notifications";

export default function ClientDashboard() {
  const { user, isAuthenticated, logout } = useLocalAuth();
  const [, navigate] = useLocation();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [tripStatus, setTripStatus] = useState<TripStatus>("idle");
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [notifications, setNotifications] = useState<TripNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated]);

  // Poll for driver acceptance
  useEffect(() => {
    if (tripStatus !== "searching") return;

    const interval = setInterval(() => {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      const myTrip = trips.find((t: any) => t.clientId === user?.id && t.status === "accepted");
      if (myTrip) {
        setCurrentTrip(myTrip);
        setTripStatus("accepted");
        addNotification("¡Un conductor aceptó tu viaje!", "success");
        clearInterval(interval);
      }
    }, 2000);

    // Auto-assign after 8 seconds for demo
    const autoAssign = setTimeout(() => {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      const myTrip = trips.find((t: any) => t.clientId === user?.id && t.status === "requested");
      if (myTrip) {
        const updatedTrip = {
          ...myTrip,
          status: "accepted",
          driver: { name: "Carlos M.", vehicle: "Toyota Corolla", plate: "ABC-123", rating: 4.8, phone: "+1 555-0101" },
          estimatedTime: "5 min",
        };
        const updated = trips.map((t: any) => t.id === myTrip.id ? updatedTrip : t);
        localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
        setCurrentTrip(updatedTrip);
        setTripStatus("accepted");
        addNotification("¡Carlos M. aceptó tu viaje! ETA: 5 min", "success");
      }
    }, 8000);

    return () => { clearInterval(interval); clearTimeout(autoAssign); };
  }, [tripStatus, user?.id]);

  const addNotification = (message: string, type: "info" | "success" | "warning" = "info") => {
    const notif: TripNotification = {
      id: Date.now().toString(),
      message,
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
      type,
    };
    setNotifications(prev => [notif, ...prev.slice(0, 9)]);
  };

  const handleRequestTrip = () => {
    if (!pickupLocation || !dropoffLocation) {
      alert("Por favor completa ambas ubicaciones");
      return;
    }

    const fare = (Math.random() * 30 + 10).toFixed(2);
    const newTrip = {
      id: Date.now().toString(),
      clientId: user?.id,
      clientName: user?.name,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      fare: `$${fare}`,
      status: "requested",
      requestedAt: new Date().toISOString(),
      driver: null,
    };

    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    trips.push(newTrip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));

    setCurrentTrip(newTrip);
    setTripStatus("searching");
    addNotification("Buscando conductor disponible...", "info");
  };

  const handleCancelTrip = () => {
    if (currentTrip) {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      const updated = trips.filter((t: any) => t.id !== currentTrip.id);
      localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
    }
    setTripStatus("idle");
    setCurrentTrip(null);
    setPickupLocation("");
    setDropoffLocation("");
    addNotification("Viaje cancelado", "warning");
  };

  const handleCompleteTrip = () => {
    setTripStatus("completed");
    addNotification("¡Viaje completado! Gracias por usar WhatsApp Taxi", "success");
    setTimeout(() => {
      setTripStatus("idle");
      setCurrentTrip(null);
      setPickupLocation("");
      setDropoffLocation("");
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) return null;

  const unreadCount = notifications.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0] || "C"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{user?.name}</h1>
              <p className="text-sm text-slate-500">Panel de Cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 text-sm">Notificaciones</h3>
                    <button onClick={() => setNotifications([])} className="text-xs text-slate-500 hover:text-slate-700">Limpiar</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">Sin notificaciones</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-100 flex gap-3 ${n.type === "success" ? "bg-green-50" : n.type === "warning" ? "bg-yellow-50" : "bg-blue-50"}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`} />
                          <div>
                            <p className="text-sm text-slate-800">{n.message}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Solicitud */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {tripStatus === "idle" ? "Solicitar Viaje" : "Estado del Viaje"}
              </h2>

              {/* Idle: Formulario */}
              {tripStatus === "idle" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin size={16} className="inline mr-2 text-green-600" />
                      Ubicación de Recogida
                    </label>
                    <input
                      type="text"
                      placeholder="¿Dónde te recogemos?"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin size={16} className="inline mr-2 text-red-500" />
                      Destino
                    </label>
                    <input
                      type="text"
                      placeholder="¿A dónde vas?"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <Button onClick={handleRequestTrip} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-semibold rounded-lg">
                    Solicitar Viaje Ahora
                  </Button>
                </div>
              )}

              {/* Searching */}
              {tripStatus === "searching" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                    <MapPin size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Buscando conductor...</h3>
                  <p className="text-slate-500 text-sm mb-4">Estamos buscando el conductor más cercano a tu ubicación</p>
                  <div className="bg-slate-50 rounded-lg p-4 text-left mb-4">
                    <p className="text-sm text-slate-600"><strong>Recogida:</strong> {currentTrip?.pickup}</p>
                    <p className="text-sm text-slate-600 mt-1"><strong>Destino:</strong> {currentTrip?.dropoff}</p>
                    <p className="text-sm font-semibold text-green-600 mt-1"><strong>Tarifa:</strong> {currentTrip?.fare}</p>
                  </div>
                  <Button variant="outline" onClick={handleCancelTrip} className="text-red-500 border-red-200 hover:bg-red-50">
                    Cancelar Búsqueda
                  </Button>
                </div>
              )}

              {/* Accepted */}
              {(tripStatus === "accepted" || tripStatus === "in_progress") && currentTrip?.driver && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <p className="text-sm font-medium text-green-800">
                      {tripStatus === "accepted" ? "¡Conductor en camino!" : "Viaje en progreso"}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{currentTrip.driver.name}</h3>
                        <p className="text-sm text-slate-500">{currentTrip.driver.vehicle}</p>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">Placa: {currentTrip.driver.plate}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                        <Star size={14} className="text-yellow-500" />
                        <span className="text-sm font-semibold text-yellow-700">{currentTrip.driver.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">ETA</p>
                          <p className="font-semibold text-slate-900">{currentTrip.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Tarifa</p>
                          <p className="font-semibold text-slate-900">{currentTrip.fare}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Button variant="outline" onClick={handleCancelTrip} className="text-red-500 border-red-200">
                        Cancelar
                      </Button>
                      {tripStatus === "accepted" ? (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                          <Phone size={16} /> Llamar
                        </Button>
                      ) : (
                        <Button onClick={handleCompleteTrip} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                          <CheckCircle size={16} /> Completar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Completed */}
              {tripStatus === "completed" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">¡Viaje completado!</h3>
                  <p className="text-slate-500 text-sm">Gracias por usar WhatsApp Taxi</p>
                </div>
              )}
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-4">
            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Mi Perfil</h3>
              <div className="space-y-2 text-sm">
                <div><p className="text-slate-500">Nombre</p><p className="font-medium text-slate-900">{user?.name}</p></div>
                <div><p className="text-slate-500">Email</p><p className="font-medium text-slate-900 text-xs">{user?.email}</p></div>
                <div><p className="text-slate-500">Teléfono</p><p className="font-medium text-slate-900">{user?.phone || "No registrado"}</p></div>
                <div className="flex items-center gap-2 pt-1">
                  <Star size={16} className="text-yellow-500" />
                  <div><p className="text-slate-500 text-xs">Calificación</p><p className="font-medium text-slate-900">5.0 / 5.0</p></div>
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Historial Reciente</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-500 text-center py-2">Tus viajes aparecerán aquí</p>
              </div>
            </Card>

            <Card className="p-4 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">¿Necesitas Ayuda?</h3>
              <p className="text-sm text-green-800 mb-3">Contáctanos en cualquier momento</p>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">Contactar Soporte</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
