import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Star, DollarSign, LogOut, CheckCircle, XCircle, Bell, Car } from "lucide-react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";

const TRIPS_KEY = "wt_pending_trips";

interface PendingTrip {
  id: string;
  clientId: number;
  clientName: string;
  pickup: string;
  dropoff: string;
  fare: string;
  status: string;
  requestedAt: string;
  driver?: any;
  estimatedTime?: string;
}

export default function DriverDashboard() {
  const { user, isAuthenticated, logout } = useLocalAuth();
  const [, navigate] = useLocation();
  const [isOnline, setIsOnline] = useState(false);
  const [pendingTrips, setPendingTrips] = useState<PendingTrip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<PendingTrip | null>(null);
  const [tripPhase, setTripPhase] = useState<"idle" | "accepted" | "in_progress" | "completed">("idle");
  const [newTripAlert, setNewTripAlert] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated]);

  // Poll for new trips when online
  const checkTrips = useCallback(() => {
    if (!isOnline || tripPhase !== "idle") return;
    const trips: PendingTrip[] = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    const available = trips.filter(t => t.status === "requested");
    if (available.length > pendingTrips.length) {
      setNewTripAlert(true);
      setTimeout(() => setNewTripAlert(false), 3000);
    }
    setPendingTrips(available);
  }, [isOnline, tripPhase, pendingTrips.length]);

  useEffect(() => {
    const interval = setInterval(checkTrips, 2000);
    return () => clearInterval(interval);
  }, [checkTrips]);

  const handleAcceptTrip = (trip: PendingTrip) => {
    const trips: PendingTrip[] = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    const updated = trips.map(t => t.id === trip.id ? {
      ...t,
      status: "accepted",
      driver: {
        id: user?.id,
        name: user?.name,
        phone: user?.phone || "+1 555-0000",
        vehicle: "Mi Vehículo",
        plate: "XXX-000",
        rating: 4.8,
      },
      estimatedTime: "5 min",
    } : t);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
    setCurrentTrip({ ...trip, status: "accepted", estimatedTime: "5 min" });
    setTripPhase("accepted");
    setPendingTrips([]);
  };

  const handleStartTrip = () => {
    if (!currentTrip) return;
    const trips: PendingTrip[] = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    const updated = trips.map(t => t.id === currentTrip.id ? { ...t, status: "in_progress" } : t);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
    setTripPhase("in_progress");
  };

  const handleCompleteTrip = () => {
    if (!currentTrip) return;
    const trips: PendingTrip[] = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    const updated = trips.filter(t => t.id !== currentTrip.id);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));

    const fareNum = parseFloat(currentTrip.fare.replace("$", "")) || 0;
    setEarnings(prev => prev + fareNum);
    setCompletedCount(prev => prev + 1);
    setTripPhase("completed");

    setTimeout(() => {
      setCurrentTrip(null);
      setTripPhase("idle");
    }, 2000);
  };

  const handleRejectTrip = (tripId: string) => {
    setPendingTrips(prev => prev.filter(t => t.id !== tripId));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.[0] || "D"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{user?.name}</h1>
              <p className="text-sm text-slate-500">Panel de Conductor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isOnline ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
              {isOnline ? "● En Línea" : "○ Desconectado"}
            </div>
            {newTripAlert && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                <Bell size={14} /> ¡Nuevo viaje!
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toggle Online */}
            <Card className="p-6 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Disponibilidad</h2>
                  <p className="text-sm text-slate-600">
                    {isOnline ? "Estás disponible para recibir viajes" : "Activa para recibir solicitudes de viaje"}
                  </p>
                </div>
                <Button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-6 py-3 font-semibold rounded-xl transition-all ${isOnline ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
                >
                  {isOnline ? "Desconectar" : "Conectar"}
                </Button>
              </div>
            </Card>

            {/* Viaje Actual */}
            {currentTrip && tripPhase !== "idle" ? (
              <Card className="p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {tripPhase === "accepted" ? "Viaje Aceptado" : tripPhase === "in_progress" ? "Viaje en Progreso" : "Viaje Completado"}
                </h2>

                {tripPhase === "completed" ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">¡Viaje completado!</h3>
                    <p className="text-green-600 font-bold text-xl mt-2">{currentTrip.fare}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">{currentTrip.clientName}</p>
                          <p className="text-xs text-slate-500">Cliente</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-xl">{currentTrip.fare}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <MapPin size={12} className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Recogida</p>
                            <p className="font-medium text-slate-900">{currentTrip.pickup}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <MapPin size={12} className="text-red-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Destino</p>
                            <p className="font-medium text-slate-900">{currentTrip.dropoff}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => { setCurrentTrip(null); setTripPhase("idle"); }} className="text-red-500 border-red-200">
                        <XCircle size={16} className="mr-2" /> Cancelar
                      </Button>
                      {tripPhase === "accepted" ? (
                        <Button onClick={handleStartTrip} className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Car size={16} className="mr-2" /> Iniciar Viaje
                        </Button>
                      ) : (
                        <Button onClick={handleCompleteTrip} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle size={16} className="mr-2" /> Completar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              /* Viajes Disponibles */
              <Card className="p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Viajes Disponibles {pendingTrips.length > 0 && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-sm rounded-full">{pendingTrips.length}</span>}
                </h2>

                {!isOnline ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                    <Car size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">Conéctate para ver viajes disponibles</p>
                    <Button onClick={() => setIsOnline(true)} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                      Conectar Ahora
                    </Button>
                  </div>
                ) : pendingTrips.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                    <Bell size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">Esperando solicitudes de viaje...</p>
                    <p className="text-sm text-slate-500 mt-1">Te notificaremos cuando haya un viaje disponible</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTrips.map(trip => (
                      <div key={trip.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">{trip.clientName}</p>
                            <p className="text-xs text-slate-500">{new Date(trip.requestedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                          <p className="font-bold text-green-600 text-xl">{trip.fare}</p>
                        </div>
                        <div className="space-y-1.5 text-sm mb-4">
                          <p className="text-slate-600"><MapPin size={14} className="inline mr-1 text-green-500" />{trip.pickup}</p>
                          <p className="text-slate-600"><MapPin size={14} className="inline mr-1 text-red-500" />{trip.dropoff}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleRejectTrip(trip.id)} className="text-red-500 border-red-200">
                            Rechazar
                          </Button>
                          <Button size="sm" onClick={() => handleAcceptTrip(trip)} className="bg-green-500 hover:bg-green-600 text-white">
                            Aceptar Viaje
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-4">
            <Card className="p-4 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">Ganancias de Hoy</h3>
              <p className="text-3xl font-bold text-green-600">${earnings.toFixed(2)}</p>
              <p className="text-sm text-green-700 mt-1">{completedCount} viajes completados</p>
            </Card>

            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Mi Perfil</h3>
              <div className="space-y-2 text-sm">
                <div><p className="text-slate-500">Nombre</p><p className="font-medium text-slate-900">{user?.name}</p></div>
                <div><p className="text-slate-500">Email</p><p className="font-medium text-slate-900 text-xs">{user?.email}</p></div>
                <div className="flex items-center gap-2 pt-1">
                  <Star size={16} className="text-yellow-500" />
                  <div><p className="text-slate-500 text-xs">Calificación</p><p className="font-medium text-slate-900">5.0 / 5.0</p></div>
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Estadísticas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><p className="text-slate-600">Viajes Hoy</p><p className="font-semibold">{completedCount}</p></div>
                <div className="flex justify-between"><p className="text-slate-600">Ganancias</p><p className="font-semibold text-green-600">${earnings.toFixed(2)}</p></div>
                <div className="flex justify-between"><p className="text-slate-600">Estado</p><p className={`font-semibold ${isOnline ? "text-green-600" : "text-slate-500"}`}>{isOnline ? "En línea" : "Desconectado"}</p></div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
