import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Star, Clock, DollarSign, LogOut, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function DriverDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isOnline, setIsOnline] = useState(false);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [totalEarnings, setTotalEarnings] = useState("$1,245.50");
  const [tripStatus, setTripStatus] = useState<"idle" | "assigned" | "in_progress" | "completed">("idle");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated]);

  // Simular viajes disponibles
  useEffect(() => {
    if (isOnline) {
      setAvailableTrips([
        {
          id: 1,
          client: "María García",
          pickup: "Calle Principal 123",
          dropoff: "Centro Comercial Plaza",
          distance: "3.2 km",
          estimatedFare: "$18.50",
          rating: 4.7,
        },
        {
          id: 2,
          client: "Juan López",
          pickup: "Aeropuerto Internacional",
          dropoff: "Hotel Downtown",
          distance: "12.5 km",
          estimatedFare: "$42.00",
          rating: 4.9,
        },
        {
          id: 3,
          client: "Ana Martínez",
          pickup: "Estación de Tren",
          dropoff: "Barrio Residencial",
          distance: "5.8 km",
          estimatedFare: "$25.75",
          rating: 4.6,
        },
      ]);
    } else {
      setAvailableTrips([]);
    }
  }, [isOnline]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptTrip = (trip: any) => {
    setCurrentTrip(trip);
    setTripStatus("assigned");
    setAvailableTrips(availableTrips.filter((t) => t.id !== trip.id));
  };

  const handleStartTrip = () => {
    setTripStatus("in_progress");
  };

  const handleCompleteTrip = () => {
    setTripStatus("completed");
    // Aquí se sumaría a las ganancias
    setTimeout(() => {
      setCurrentTrip(null);
      setTripStatus("idle");
    }, 2000);
  };

  const handleCancelTrip = () => {
    setCurrentTrip(null);
    setTripStatus("idle");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || "D"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Hola, {user?.name}</h1>
              <p className="text-sm text-slate-500">Panel de Conductor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {isOnline ? "En Línea" : "Desconectado"}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut size={16} />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado Online/Offline */}
            <Card className="p-6 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Estado de Disponibilidad</h2>
                  <p className="text-sm text-slate-600">
                    {isOnline ? "Estás disponible para recibir viajes" : "Activa tu estado para recibir solicitudes"}
                  </p>
                </div>
                <Button
                  onClick={handleToggleOnline}
                  className={`px-6 py-3 font-semibold rounded-lg transition ${
                    isOnline ? "bg-green-500 hover:bg-green-600 text-white" : "bg-slate-300 hover:bg-slate-400 text-slate-700"
                  }`}
                >
                  {isOnline ? "Desconectar" : "Conectar"}
                </Button>
              </div>
            </Card>

            {/* Viaje Actual o Viajes Disponibles */}
            {currentTrip ? (
              <Card className="p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Viaje Asignado</h2>

                {/* Información del Cliente */}
                <div className="border border-slate-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{currentTrip.client}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="text-sm text-slate-600">{currentTrip.rating}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone size={16} />
                      Llamar
                    </Button>
                  </div>

                  {/* Ubicaciones */}
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <MapPin size={16} className="text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Recogida</p>
                        <p className="font-medium text-slate-900">{currentTrip.pickup}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <MapPin size={16} className="text-red-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Destino</p>
                        <p className="font-medium text-slate-900">{currentTrip.dropoff}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 mt-4">
                    <div>
                      <p className="text-xs text-slate-500">Distancia</p>
                      <p className="font-semibold text-slate-900">{currentTrip.distance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tarifa Estimada</p>
                      <p className="font-semibold text-slate-900">{currentTrip.estimatedFare}</p>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleCancelTrip} className="gap-2">
                    <XCircle size={16} />
                    Rechazar
                  </Button>
                  {tripStatus === "assigned" && (
                    <Button onClick={handleStartTrip} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      <CheckCircle size={16} />
                      Iniciar Viaje
                    </Button>
                  )}
                  {tripStatus === "in_progress" && (
                    <Button onClick={handleCompleteTrip} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <CheckCircle size={16} />
                      Completar Viaje
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Viajes Disponibles</h2>

                {isOnline ? (
                  availableTrips.length > 0 ? (
                    <div className="space-y-3">
                      {availableTrips.map((trip) => (
                        <div key={trip.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-slate-900">{trip.client}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <Star size={14} className="text-yellow-500" />
                                <span className="text-sm text-slate-600">{trip.rating}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-lg">{trip.estimatedFare}</p>
                              <p className="text-xs text-slate-500">{trip.distance}</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3 text-sm">
                            <p className="text-slate-600">
                              <MapPin size={14} className="inline mr-2" />
                              De: {trip.pickup}
                            </p>
                            <p className="text-slate-600">
                              <MapPin size={14} className="inline mr-2" />
                              A: {trip.dropoff}
                            </p>
                          </div>

                          <Button onClick={() => handleAcceptTrip(trip)} className="w-full bg-green-500 hover:bg-green-600 text-white">
                            Aceptar Viaje
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle size={48} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-600">No hay viajes disponibles en este momento</p>
                      <p className="text-sm text-slate-500 mt-1">Mantente conectado para recibir notificaciones</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                    <AlertCircle size={48} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-600 font-semibold">Conecta tu estado para ver viajes disponibles</p>
                    <Button onClick={handleToggleOnline} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
                      Conectar Ahora
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-4">
            {/* Ganancias del Día */}
            <Card className="p-4 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">Ganancias de Hoy</h3>
              <p className="text-3xl font-bold text-green-600">{totalEarnings}</p>
              <p className="text-sm text-green-700 mt-2">5 viajes completados</p>
            </Card>

            {/* Información del Conductor */}
            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Mi Información</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-500">Licencia</p>
                  <p className="font-medium text-slate-900">DL-123456</p>
                </div>
                <div>
                  <p className="text-slate-500">Vehículo</p>
                  <p className="font-medium text-slate-900">Toyota Corolla</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <div>
                    <p className="text-slate-500">Calificación</p>
                    <p className="font-medium text-slate-900">4.8 / 5.0</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Estadísticas */}
            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Estadísticas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <p className="text-slate-600">Viajes Totales</p>
                  <p className="font-semibold text-slate-900">248</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-600">Horas Conectado</p>
                  <p className="font-semibold text-slate-900">1,240</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-600">Ganancias Totales</p>
                  <p className="font-semibold text-slate-900">$8,450</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
