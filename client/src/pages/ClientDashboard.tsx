import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Star, Clock, DollarSign, LogOut, CheckCircle, Bell, Navigation, Car, X, ChevronRight } from "lucide-react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { MapView } from "@/components/Map";

type TripStatus = "idle" | "searching" | "accepted" | "in_progress" | "completed";

interface TripNotification {
  id: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
}

const TRIPS_KEY = "wt_pending_trips";

export default function ClientDashboard() {
  const { user, isAuthenticated, logout } = useLocalAuth();
  const [, navigate] = useLocation();

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>("idle");
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [notifications, setNotifications] = useState<TripNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [loyaltyPoints, setLoyaltyPoints] = useState(120);

  const mapRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  // Poll for driver acceptance
  useEffect(() => {
    if (tripStatus !== "searching") return;
    const autoAssign = setTimeout(() => {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      const myTrip = trips.find((t: any) => t.clientId === user?.id && t.status === "requested");
      if (myTrip) {
        const updatedTrip = {
          ...myTrip,
          status: "accepted",
          driver: { name: "Carlos M.", vehicle: "Toyota Corolla", plate: "ABC-123", rating: 4.8, phone: "+1 555-0101", photo: "C" },
          estimatedTime: "4 min",
        };
        const trips2 = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
        const updated = trips2.map((t: any) => t.id === myTrip.id ? updatedTrip : t);
        localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
        setCurrentTrip(updatedTrip);
        setTripStatus("accepted");
        addNotification("🚕 ¡Carlos M. aceptó tu viaje! ETA: 4 min", "success");
        setLoyaltyPoints(p => p + 10);
      }
    }, 6000);
    return () => clearTimeout(autoAssign);
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

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: { strokeColor: "#25D366", strokeWeight: 5 },
    });

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(coords);
        map.setZoom(15);
        geocoderRef.current?.geocode({ location: coords }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            setPickupLocation(results[0].formatted_address);
            setPickupCoords(coords);
            pickupMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
              map,
              position: coords,
              title: "Recogida",
            });
          }
        });
      });
    }
  }, []);

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPickupCoords(coords);
      mapRef.current?.setCenter(coords);
      mapRef.current?.setZoom(16);
      geocoderRef.current?.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setPickupLocation(results[0].formatted_address);
        }
        setGettingLocation(false);
      });
      if (pickupMarkerRef.current) pickupMarkerRef.current.map = null;
      pickupMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: coords,
        title: "Mi ubicación",
      });
    }, () => setGettingLocation(false));
  };

  const geocodeAddress = (address: string, isPickup: boolean) => {
    if (!geocoderRef.current || !address.trim()) return;
    geocoderRef.current.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const coords = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        if (isPickup) {
          setPickupCoords(coords);
          if (pickupMarkerRef.current) pickupMarkerRef.current.map = null;
          pickupMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current!,
            position: coords,
            title: "Recogida",
          });
        } else {
          setDropoffCoords(coords);
          if (dropoffMarkerRef.current) dropoffMarkerRef.current.map = null;
          dropoffMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current!,
            position: coords,
            title: "Destino",
          });
        }

        // Calculate route if both coords available
        const pickup = isPickup ? coords : pickupCoords;
        const dropoff = isPickup ? dropoffCoords : coords;
        if (pickup && dropoff && directionsRendererRef.current) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route({
            origin: pickup,
            destination: dropoff,
            travelMode: google.maps.TravelMode.DRIVING,
          }, (result, status) => {
            if (status === "OK" && result) {
              directionsRendererRef.current!.setDirections(result);
              const leg = result.routes[0]?.legs[0];
              if (leg) {
                const distKm = (leg.distance?.value || 0) / 1000;
                const rates: Record<string, number> = { economy: 1.2, comfort: 1.8, premium: 2.5, suv: 3.0 };
                const fare = (2.5 + distKm * (rates[selectedVehicle] || 1.2)).toFixed(2);
                setEstimatedFare(`$${fare}`);
                setEstimatedTime(leg.duration?.text || "~10 min");
              }
            }
          });
        }
      }
    });
  };

  const handleRequestTrip = () => {
    if (!pickupLocation || !dropoffLocation) {
      addNotification("Por favor completa ambas ubicaciones", "warning");
      return;
    }
    const newTrip = {
      id: Date.now().toString(),
      clientId: user?.id,
      clientName: user?.name,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      fare: estimatedFare || "$15.00",
      status: "requested",
      requestedAt: new Date().toISOString(),
      vehicleType: selectedVehicle,
      driver: null,
    };
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    trips.push(newTrip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    setCurrentTrip(newTrip);
    setTripStatus("searching");
    addNotification("🔍 Buscando conductor disponible...", "info");
  };

  const handleCancelTrip = () => {
    if (currentTrip) {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      localStorage.setItem(TRIPS_KEY, JSON.stringify(trips.filter((t: any) => t.id !== currentTrip.id)));
    }
    setTripStatus("idle");
    setCurrentTrip(null);
    addNotification("Viaje cancelado", "warning");
  };

  const handleCompleteTrip = () => {
    setTripStatus("completed");
    setLoyaltyPoints(p => p + 50);
    addNotification("✅ ¡Viaje completado! +50 puntos de lealtad", "success");
    setTimeout(() => { setTripStatus("idle"); setCurrentTrip(null); }, 3000);
  };

  const vehicles = [
    { id: "economy", label: "Económico", icon: "🚗", price: "$1.20/km", time: "3 min", capacity: 4 },
    { id: "comfort", label: "Confort", icon: "🚙", price: "$1.80/km", time: "5 min", capacity: 4 },
    { id: "premium", label: "Premium", icon: "🚘", price: "$2.50/km", time: "8 min", capacity: 4 },
    { id: "suv", label: "SUV", icon: "🚐", price: "$3.00/km", time: "6 min", capacity: 6 },
  ];

  const loyaltyLevel = loyaltyPoints < 200 ? { name: "Bronce", color: "text-amber-600", next: 200 } :
    loyaltyPoints < 500 ? { name: "Plata", color: "text-slate-400", next: 500 } :
    loyaltyPoints < 1000 ? { name: "Oro", color: "text-yellow-500", next: 1000 } :
    { name: "Platino", color: "text-purple-500", next: 9999 };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || "C"}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{user?.name}</p>
              <p className={`text-xs font-medium ${loyaltyLevel.color}`}>⭐ {loyaltyLevel.name} · {loyaltyPoints} pts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell size={20} className="text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 text-sm">Notificaciones</h3>
                    <button onClick={() => setNotifications([])} className="text-xs text-slate-500 hover:text-slate-700">Limpiar</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500 text-center">Sin notificaciones</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b border-slate-100 flex gap-3 ${n.type === "success" ? "bg-green-50" : n.type === "warning" ? "bg-yellow-50" : "bg-blue-50"}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`} />
                        <div>
                          <p className="text-sm text-slate-800">{n.message}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }} className="gap-1.5 text-xs">
              <LogOut size={14} /> Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mapa - lado izquierdo */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <MapView
            initialCenter={{ lat: 19.4326, lng: -99.1332 }}
            initialZoom={13}
            onMapReady={handleMapReady}
            className="w-full h-full"
          />
          {/* Overlay de estado del viaje en el mapa */}
          {tripStatus === "searching" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-900">Buscando conductor...</span>
            </div>
          )}
          {tripStatus === "accepted" && currentTrip?.driver && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-10">
              <Car size={16} />
              <span className="text-sm font-semibold">{currentTrip.driver.name} · ETA {currentTrip.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Panel lateral derecho */}
        <div className="w-full lg:w-96 bg-white shadow-xl flex flex-col overflow-y-auto">
          {/* Solicitar Viaje */}
          {tripStatus === "idle" && (
            <div className="p-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-900">¿A dónde vamos?</h2>

              {/* Pickup */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
                <input
                  type="text"
                  placeholder="Ubicación de recogida"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  onBlur={(e) => geocodeAddress(e.target.value, true)}
                  className="w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-slate-50"
                />
                <button
                  onClick={handleGetMyLocation}
                  disabled={gettingLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 disabled:opacity-50"
                  title="Usar mi ubicación"
                >
                  <Navigation size={16} className={gettingLocation ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Dropoff */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow" />
                <input
                  type="text"
                  placeholder="¿A dónde vas?"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  onBlur={(e) => geocodeAddress(e.target.value, false)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-slate-50"
                />
              </div>

              {/* Tipos de vehículo */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tipo de vehículo</p>
                <div className="grid grid-cols-2 gap-2">
                  {vehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${selectedVehicle === v.id ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="text-xl mb-1">{v.icon}</div>
                      <p className="text-xs font-semibold text-slate-900">{v.label}</p>
                      <p className="text-xs text-slate-500">{v.price}</p>
                      <p className="text-xs text-slate-400">{v.time} · {v.capacity} pasajeros</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimación */}
              {estimatedFare && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-green-600" />
                    <span className="text-sm text-green-800">{estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="text-lg font-bold text-green-800">{estimatedFare}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleRequestTrip}
                className="w-full py-3 font-bold text-base rounded-xl shadow-lg shadow-green-500/25"
                style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}
              >
                Solicitar Viaje <ChevronRight size={18} className="ml-1" />
              </Button>

              {/* Lealtad */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-purple-800">Programa de Lealtad</p>
                  <p className={`text-xs font-bold ${loyaltyLevel.color}`}>{loyaltyLevel.name}</p>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((loyaltyPoints / loyaltyLevel.next) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-purple-600 mt-1">{loyaltyPoints} / {loyaltyLevel.next} pts para siguiente nivel</p>
              </div>
            </div>
          )}

          {/* Buscando */}
          {tripStatus === "searching" && (
            <div className="p-5 flex flex-col items-center gap-4 flex-1 justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Car size={36} className="text-green-600 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Buscando conductor...</h3>
              <p className="text-sm text-slate-500 text-center">Estamos encontrando el conductor más cercano</p>
              <div className="bg-slate-50 rounded-xl p-4 w-full text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Recogida</span><span className="font-medium text-slate-900 text-right max-w-[60%] truncate">{currentTrip?.pickup}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Destino</span><span className="font-medium text-slate-900 text-right max-w-[60%] truncate">{currentTrip?.dropoff}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tarifa</span><span className="font-bold text-green-600">{currentTrip?.fare}</span></div>
              </div>
              <Button variant="outline" onClick={handleCancelTrip} className="w-full text-red-500 border-red-200 hover:bg-red-50">
                <X size={16} className="mr-2" /> Cancelar
              </Button>
            </div>
          )}

          {/* Conductor aceptó */}
          {(tripStatus === "accepted" || tripStatus === "in_progress") && currentTrip?.driver && (
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  {tripStatus === "accepted" ? "¡Conductor en camino!" : "Viaje en progreso"}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-50 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {currentTrip.driver.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg">{currentTrip.driver.name}</p>
                    <p className="text-sm text-slate-500">{currentTrip.driver.vehicle}</p>
                    <p className="text-xs font-mono text-slate-400">{currentTrip.driver.plate}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-yellow-700">{currentTrip.driver.rating}</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">ETA</p>
                      <p className="font-bold text-slate-900">{currentTrip.estimatedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Tarifa</p>
                      <p className="font-bold text-green-600">{currentTrip.fare}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleCancelTrip} className="text-red-500 border-red-200">
                  <X size={16} className="mr-1" /> Cancelar
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
          )}

          {/* Completado */}
          {tripStatus === "completed" && (
            <div className="p-5 flex flex-col items-center gap-4 flex-1 justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={36} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">¡Viaje completado!</h3>
              <p className="text-green-600 font-bold text-2xl">{currentTrip?.fare}</p>
              <p className="text-sm text-purple-600">+50 puntos de lealtad ganados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
