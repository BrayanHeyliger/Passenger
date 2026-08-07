import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Star, Clock, DollarSign, LogOut } from "lucide-react";

export default function ClientDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [tripStatus, setTripStatus] = useState<"idle" | "requesting" | "accepted" | "in_progress" | "completed">("idle");
  const [currentTrip, setCurrentTrip] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated]);

  const handleRequestTrip = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert("Por favor completa ambas ubicaciones");
      return;
    }

    setTripStatus("requesting");
    // Aquí iría la llamada a la API para solicitar un viaje
    console.log("Solicitando viaje:", { pickupLocation, dropoffLocation });

    // Simulación
    setTimeout(() => {
      setTripStatus("accepted");
      setCurrentTrip({
        id: 1,
        driver: "Carlos M.",
        vehicle: "Toyota Corolla Blanca",
        plate: "ABC-123",
        rating: 4.8,
        pickupLocation,
        dropoffLocation,
        fare: "$45.50",
        estimatedTime: "8 min",
      });
    }, 3000);
  };

  const handleCancelTrip = () => {
    setTripStatus("idle");
    setCurrentTrip(null);
    setPickupLocation("");
    setDropoffLocation("");
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || "U"}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Bienvenido, {user?.name}</h1>
              <p className="text-sm text-slate-500">Panel de Cliente</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Solicitud */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Solicitar Viaje</h2>

              {tripStatus === "idle" ? (
                <div className="space-y-4">
                  {/* Ubicación de Recogida */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Ubicación de Recogida
                    </label>
                    <input
                      type="text"
                      placeholder="Ingresa tu ubicación actual"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  {/* Ubicación de Destino */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Ubicación de Destino
                    </label>
                    <input
                      type="text"
                      placeholder="¿A dónde vas?"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  {/* Botón Solicitar */}
                  <Button
                    onClick={handleRequestTrip}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 font-semibold rounded-lg transition"
                  >
                    Solicitar Viaje
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Estado del Viaje */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      {tripStatus === "requesting" && "Buscando conductor..."}
                      {tripStatus === "accepted" && "¡Conductor asignado!"}
                      {tripStatus === "in_progress" && "Viaje en progreso"}
                      {tripStatus === "completed" && "Viaje completado"}
                    </p>
                  </div>

                  {/* Información del Conductor */}
                  {currentTrip && (
                    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{currentTrip.driver}</h3>
                          <p className="text-sm text-slate-500">{currentTrip.vehicle}</p>
                          <p className="text-xs text-slate-400">Placa: {currentTrip.plate}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                          <Star size={14} className="text-yellow-500" />
                          <span className="text-sm font-semibold text-yellow-700">{currentTrip.rating}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Tiempo estimado</p>
                            <p className="font-semibold text-slate-900">{currentTrip.estimatedTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-slate-500" />
                          <div>
                            <p className="text-xs text-slate-500">Tarifa estimada</p>
                            <p className="font-semibold text-slate-900">{currentTrip.fare}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <Button variant="outline" onClick={handleCancelTrip}>
                          Cancelar
                        </Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white">
                          <Phone size={16} className="mr-2" />
                          Llamar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Panel Lateral - Información */}
          <div className="space-y-4">
            {/* Tarjeta de Perfil */}
            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Mi Perfil</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Viajes realizados</p>
                  <p className="font-medium text-slate-900">12</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <div>
                    <p className="text-slate-500">Calificación</p>
                    <p className="font-medium text-slate-900">4.9 / 5.0</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tarjeta de Métodos de Pago */}
            <Card className="p-4 shadow-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Métodos de Pago</h3>
              <div className="space-y-2">
                <div className="p-2 bg-slate-100 rounded border border-slate-200 text-sm">
                  <p className="text-slate-600">Tarjeta Visa •••• 4242</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Agregar Método
                </Button>
              </div>
            </Card>

            {/* Tarjeta de Ayuda */}
            <Card className="p-4 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">¿Necesitas Ayuda?</h3>
              <p className="text-sm text-green-800 mb-3">Contacta con nuestro equipo de soporte</p>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                Contactar Soporte
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
