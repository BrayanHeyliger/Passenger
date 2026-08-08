import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Phone, Star, Clock, DollarSign, LogOut, CheckCircle, Bell,
  Car, X, ChevronRight, AlertTriangle, Share2, Tag, Calendar,
  History, Home, Briefcase, MessageCircle, MapPin, Navigation
} from "lucide-react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { MapView } from "@/components/Map";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { TripChat } from "@/components/TripChat";
import { toast } from "sonner";

type TripStatus = "idle" | "searching" | "accepted" | "in_progress" | "completed" | "rating";
type ActivePanel = "request" | "history" | "scheduled" | "promo";

interface TripNotification { id: string; message: string; time: string; type: "info" | "success" | "warning"; }
interface TripHistory { id: string; date: string; from: string; to: string; fare: string; driver: string; rating: number; }

const TRIPS_KEY = "wt_pending_trips";
const HISTORY_KEY = "wt_trip_history";

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
  const [estimatedDistance, setEstimatedDistance] = useState<string | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [allFares, setAllFares] = useState<Record<string, string>>({});
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  // Availability counters per vehicle type (derived from spawned markers)
  const [vehicleAvailability, setVehicleAvailability] = useState<Record<string, { count: number; eta: string }>>({
    economy: { count: 3, eta: "2 min" },
    comfort:  { count: 2, eta: "4 min" },
    premium:  { count: 1, eta: "7 min" },
    suv:      { count: 2, eta: "5 min" },
  });
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [loyaltyPoints, setLoyaltyPoints] = useState(120);
  const [activePanel, setActivePanel] = useState<ActivePanel>("request");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [driverRating, setDriverRating] = useState(0);
  const [driverComment, setDriverComment] = useState("");
  const [tripHistory, setTripHistory] = useState<TripHistory[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [showBidMode, setShowBidMode] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  const mapRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const vehicleMarkersRef = useRef<any[]>([]);
  const vehicleAnimFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const driverMarkerRef = useRef<any>(null);
  const driverAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [driverEta, setDriverEta] = useState<string | null>(null);
  const [driverDistance, setDriverDistance] = useState<string | null>(null);

  // ── Nearby vehicles simulation ──────────────────────────────────────────────
  // Generate a set of fake nearby drivers that drift slowly around a center point
  const spawnNearbyVehicles = useCallback((map: google.maps.Map, center: { lat: number; lng: number }) => {
    // Clear previous markers
    vehicleMarkersRef.current.forEach(m => { m.marker.map = null; });
    vehicleMarkersRef.current = [];
    if (vehicleAnimFrameRef.current) clearInterval(vehicleAnimFrameRef.current);

    const vehicleTypes = [
      { id: "economy", emoji: "🚗", label: "Económico", color: "#25D366" },
      { id: "comfort",  emoji: "🚙", label: "Confort",   color: "#3B82F6" },
      { id: "premium",  emoji: "🚘", label: "Premium",   color: "#8B5CF6" },
      { id: "suv",      emoji: "🚐", label: "SUV",       color: "#F59E0B" },
    ];

    // Spread 8 vehicles randomly within ~600 m of center
    const spread = 0.006; // ~600 m in degrees
    const vehicles = Array.from({ length: 8 }, (_, i) => {
      const type = vehicleTypes[i % vehicleTypes.length];
      const lat = center.lat + (Math.random() - 0.5) * spread;
      const lng = center.lng + (Math.random() - 0.5) * spread;
      const driftLat = (Math.random() - 0.5) * 0.00004;
      const driftLng = (Math.random() - 0.5) * 0.00004;
      const heading = Math.random() * 360;

      // Build custom HTML element for the marker
      const el = document.createElement("div");
      el.style.cssText = [
        "width:36px", "height:36px", "border-radius:50%",
        `background:${type.color}`, "border:2.5px solid white",
        "box-shadow:0 2px 10px rgba(0,0,0,0.25)",
        "display:flex", "align-items:center", "justify-content:center",
        "font-size:18px", "cursor:pointer",
        "transition:transform 0.8s ease",
        `transform:rotate(${heading}deg)`,
      ].join(";");
      el.textContent = type.emoji;
      el.title = `${type.label} — disponible`;

      // Pulse ring
      const ring = document.createElement("div");
      ring.style.cssText = [
        "position:absolute", "inset:-6px", "border-radius:50%",
        `border:2px solid ${type.color}`, "opacity:0.4",
        "animation:pulse-ring 2s ease-out infinite",
      ].join(";");
      el.style.position = "relative";
      el.appendChild(ring);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: el,
        title: type.label,
      });

      return { marker, el, lat, lng, driftLat, driftLng, heading, type };
    });

    vehicleMarkersRef.current = vehicles;

    // Inject pulse-ring keyframes once
    // Compute availability from spawned markers and update state
    const countByType: Record<string, number> = { economy: 0, comfort: 0, premium: 0, suv: 0 };
    vehicles.forEach(v => { countByType[v.type.id] = (countByType[v.type.id] || 0) + 1; });
    // Estimate ETA based on average distance to center (rough approximation)
    const etaByCount = (n: number) => n >= 3 ? "2 min" : n === 2 ? "4 min" : n === 1 ? "7 min" : "10+ min";
    setVehicleAvailability({
      economy: { count: countByType.economy, eta: etaByCount(countByType.economy) },
      comfort:  { count: countByType.comfort,  eta: etaByCount(countByType.comfort)  },
      premium:  { count: countByType.premium,  eta: etaByCount(countByType.premium)  },
      suv:      { count: countByType.suv,      eta: etaByCount(countByType.suv)      },
    });

    if (!document.getElementById("wt-pulse-style")) {
      const style = document.createElement("style");
      style.id = "wt-pulse-style";
      style.textContent = `
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(1.6); opacity: 0;   }
          100% { transform: scale(1.6); opacity: 0;   }
        }
      `;
      document.head.appendChild(style);
    }

    // Animate: drift each vehicle slowly every 1.2 s
    vehicleAnimFrameRef.current = setInterval(() => {
      vehicleMarkersRef.current.forEach(v => {
        v.lat += v.driftLat + (Math.random() - 0.5) * 0.00003;
        v.lng += v.driftLng + (Math.random() - 0.5) * 0.00003;
        v.heading = (v.heading + (Math.random() - 0.5) * 15) % 360;
        v.marker.position = { lat: v.lat, lng: v.lng };
        v.el.style.transform = `rotate(${v.heading}deg)`;
      });
    }, 1200);
  }, []);

  // Remove vehicle markers when a trip is requested
  const clearVehicleMarkers = useCallback(() => {
    vehicleMarkersRef.current.forEach(v => { v.marker.map = null; });
    vehicleMarkersRef.current = [];
    if (vehicleAnimFrameRef.current) { clearInterval(vehicleAnimFrameRef.current); vehicleAnimFrameRef.current = null; }
  }, []);

  // Clean up on unmount
  useEffect(() => () => clearVehicleMarkers(), [clearVehicleMarkers]);

  // Recalculate fare when vehicle type changes (without re-fetching the route)
  useEffect(() => {
    if (routeDistanceKm > 0 && Object.keys(allFares).length > 0) {
      const rates: Record<string, number> = { economy: 1.2, comfort: 1.8, premium: 2.5, suv: 3.0 };
      const computed: Record<string, string> = {};
      Object.entries(rates).forEach(([vid, rate]) => {
        let f = 2.5 + routeDistanceKm * rate;
        if (promoApplied) f *= 0.85;
        computed[vid] = `$${f.toFixed(2)}`;
      });
      setAllFares(computed);
      setEstimatedFare(computed[selectedVehicle] || null);
    }
  }, [selectedVehicle, promoApplied, routeDistanceKm]);


  // Load pending trip from sessionStorage (set by HeroSection before registration)
  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = sessionStorage.getItem("pendingTrip");
    if (!raw) return;
    try {
      const pending = JSON.parse(raw);
      sessionStorage.removeItem("pendingTrip");
      if (pending.pickup) setPickupLocation(pending.pickup);
      if (pending.destination) setDropoffLocation(pending.destination);
      if (pending.vehicle) setSelectedVehicle(pending.vehicle);
      if (pending.estimate) {
        const km = pending.estimate.km || 0;
        setRouteDistanceKm(km);
        setEstimatedTime(`${pending.estimate.minutes || 0} min`);
        setEstimatedDistance(`${km} km`);
        const rates: Record<string, number> = { economy: 1.2, comfort: 1.8, premium: 2.5, suv: 3.0 };
        const computed: Record<string, string> = {};
        Object.entries(rates).forEach(([vid, rate]) => {
          computed[vid] = `$${(2.5 + km * rate).toFixed(2)}`;
        });
        setAllFares(computed);
        setEstimatedFare(computed[pending.vehicle || "economy"] || null);
      }
      toast.success("🚕 ¡Tu viaje está listo! Confirma la solicitud.", { duration: 6000 });
    } catch {
      sessionStorage.removeItem("pendingTrip");
    }
  }, [isAuthenticated]);

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated]);

  // Poll for driver acceptance
  useEffect(() => {
    if (tripStatus !== "searching") return;
    const autoAssign = setTimeout(() => {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      const myTrip = trips.find((t: any) => t.clientId === user?.id && t.status === "requested");
      if (myTrip) {
        const updatedTrip = { ...myTrip, status: "accepted", driver: { name: "Carlos M.", vehicle: "Toyota Corolla", plate: "ABC-123", rating: 4.8, phone: "+15550101" }, estimatedTime: "4 min" };
        const updated = trips.map((t: any) => t.id === myTrip.id ? updatedTrip : t);
        localStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
        setCurrentTrip(updatedTrip);
        setTripStatus("accepted");
        addNotification("🚕 ¡Carlos M. aceptó tu viaje! ETA: 4 min", "success");
        setLoyaltyPoints(p => p + 10);
        // Start driver approach animation
        if (pickupCoords) startDriverApproach(pickupCoords);
        else if (mapRef.current) {
          const center = mapRef.current.getCenter();
          if (center) startDriverApproach({ lat: center.lat(), lng: center.lng() });
        }
      }
    }, 6000);
    return () => clearTimeout(autoAssign);
  }, [tripStatus, user?.id]);

  const addNotification = (message: string, type: "info" | "success" | "warning" = "info") => {
    const notif: TripNotification = { id: Date.now().toString(), message, time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }), type };
    setNotifications(prev => [notif, ...prev.slice(0, 9)]);
  };

  const calculateRoute = useCallback((pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }) => {
    if (!mapRef.current) return;
    setIsCalculatingRoute(true);
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
        polylineOptions: { strokeColor: "#25D366", strokeWeight: 6, strokeOpacity: 0.9 },
      });
    }
    const ds = new google.maps.DirectionsService();
    ds.route({ origin: pickup, destination: dropoff, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
      setIsCalculatingRoute(false);
      if (status === "OK" && result) {
        directionsRendererRef.current!.setDirections(result);
        const leg = result.routes[0]?.legs[0];
        if (leg) {
          const distKm = (leg.distance?.value || 0) / 1000;
          setRouteDistanceKm(distKm);
          setEstimatedDistance(leg.distance?.text || `${distKm.toFixed(1)} km`);
          setEstimatedTime(leg.duration?.text || "~10 min");
          const rates: Record<string, number> = { economy: 1.2, comfort: 1.8, premium: 2.5, suv: 3.0 };
          const computed: Record<string, string> = {};
          Object.entries(rates).forEach(([vid, rate]) => {
            let f = 2.5 + distKm * rate;
            if (promoApplied) f *= 0.85;
            computed[vid] = `$${f.toFixed(2)}`;
          });
          setAllFares(computed);
          setEstimatedFare(computed[selectedVehicle] || null);
        }
      }
    });
  }, [selectedVehicle, promoApplied]);

  // Animate driver marker approaching the pickup location
  const startDriverApproach = useCallback((pickup: { lat: number; lng: number }) => {
    if (!mapRef.current) return;
    // Start driver ~800m away from pickup
    const spread = 0.008;
    let driverPos = {
      lat: pickup.lat + (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * spread),
      lng: pickup.lng + (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * spread),
    };
    // Create driver marker
    if (driverMarkerRef.current) driverMarkerRef.current.map = null;
    const el = document.createElement("div");
    el.style.cssText = "width:40px;height:40px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;font-size:20px;position:relative;";
    el.textContent = "🚕";
    const pulse = document.createElement("div");
    pulse.style.cssText = "position:absolute;inset:-8px;border-radius:50%;border:2px solid #3B82F6;opacity:0.4;animation:pulse-ring 1.5s ease-out infinite;";
    el.appendChild(pulse);
    driverMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: driverPos,
      content: el,
      title: "Tu conductor",
    });
    mapRef.current.setZoom(15);
    mapRef.current.setCenter(driverPos);
    let step = 0;
    const totalSteps = 60; // ~2 min simulation
    if (driverAnimRef.current) clearInterval(driverAnimRef.current);
    driverAnimRef.current = setInterval(() => {
      step++;
      // Move driver toward pickup
      const progress = step / totalSteps;
      const easedProgress = 1 - Math.pow(1 - progress, 2); // ease-in
      driverPos = {
        lat: driverPos.lat + (pickup.lat - driverPos.lat) * 0.06 + (Math.random() - 0.5) * 0.0001,
        lng: driverPos.lng + (pickup.lng - driverPos.lng) * 0.06 + (Math.random() - 0.5) * 0.0001,
      };
      if (driverMarkerRef.current) driverMarkerRef.current.position = driverPos;
      // Update ETA and distance
      const distLat = Math.abs(pickup.lat - driverPos.lat) * 111000;
      const distLng = Math.abs(pickup.lng - driverPos.lng) * 111000 * Math.cos(pickup.lat * Math.PI / 180);
      const distM = Math.sqrt(distLat * distLat + distLng * distLng);
      const etaSec = Math.max(0, Math.round(distM / 8)); // ~8 m/s = 28 km/h
      const etaMin = Math.ceil(etaSec / 60);
      setDriverDistance(distM < 1000 ? `${Math.round(distM)} m` : `${(distM / 1000).toFixed(1)} km`);
      setDriverEta(etaMin <= 1 ? "Menos de 1 min" : `${etaMin} min`);
      // Pan map to show both driver and pickup
      if (mapRef.current && step % 5 === 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(driverPos);
        bounds.extend(pickup);
        mapRef.current.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
      }
      // Stop when very close
      if (distM < 30 || step >= totalSteps) {
        clearInterval(driverAnimRef.current!);
        driverAnimRef.current = null;
        setDriverEta("¡Llegó!");
        setDriverDistance("0 m");
        setTripStatus("in_progress");
      }
    }, 2000); // update every 2s
  }, []);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    // Try to get user location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(coords);
        map.setZoom(15);
        setPickupCoords(coords);
        geocoderRef.current?.geocode({ location: coords }, (results, status) => {
          if (status === "OK" && results?.[0]) setPickupLocation(results[0].formatted_address);
        });
        if (pickupMarkerRef.current) pickupMarkerRef.current.map = null;
        pickupMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({ map, position: coords, title: "Mi ubicación" });
        // Spawn nearby vehicles around user location
        spawnNearbyVehicles(map, coords);
      }, () => {/* silently fail */});
    } else {
      // Fallback: spawn vehicles around default center
      spawnNearbyVehicles(map, { lat: 19.4326, lng: -99.1332 });
    }
  }, [spawnNearbyVehicles]);

  const handlePickupSelect = (address: string, coords: { lat: number; lng: number }) => {
    setPickupCoords(coords);
    mapRef.current?.setCenter(coords);
    mapRef.current?.setZoom(15);
    if (pickupMarkerRef.current) pickupMarkerRef.current.map = null;
    if (mapRef.current) {
      pickupMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: coords, title: "Recogida" });
    }
    // Re-spawn vehicles around new pickup location
    if (mapRef.current) spawnNearbyVehicles(mapRef.current, coords);
    if (dropoffCoords) calculateRoute(coords, dropoffCoords);
  };

  const handleDropoffSelect = (address: string, coords: { lat: number; lng: number }) => {
    setDropoffCoords(coords);
    if (dropoffMarkerRef.current) dropoffMarkerRef.current.map = null;
    if (mapRef.current) {
      dropoffMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: coords, title: "Destino" });
    }
    if (pickupCoords) calculateRoute(pickupCoords, coords);
    else mapRef.current?.setCenter(coords);
  };

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocalización no disponible"); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPickupCoords(coords);
      mapRef.current?.setCenter(coords);
      mapRef.current?.setZoom(16);
      geocoderRef.current?.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setPickupLocation(results[0].formatted_address);
          if (pickupMarkerRef.current) pickupMarkerRef.current.map = null;
          if (mapRef.current) {
            pickupMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: coords, title: "Mi ubicación" });
          }
          if (dropoffCoords) calculateRoute(coords, dropoffCoords);
        }
        setGettingLocation(false);
      });
    }, () => { setGettingLocation(false); toast.error("No se pudo obtener tu ubicación"); });
  };

  const handleApplyPromo = () => {
    const validCodes = ["TAXI10", "BIENVENIDO", "PROMO20", "WHATSAPP"];
    if (validCodes.includes(promoCode.toUpperCase())) {
      setPromoApplied(true);
      toast.success("¡Código aplicado! 15% de descuento");
      addNotification("🎉 Código promocional aplicado: 15% de descuento", "success");
    } else {
      toast.error("Código inválido. Prueba: BIENVENIDO");
    }
  };

  const handleRequestTrip = () => {
    if (!pickupLocation || !dropoffLocation) { toast.error("Completa origen y destino"); return; }
    // Hide vehicles when trip is requested
    clearVehicleMarkers();
    const fare = showBidMode && bidAmount ? `$${bidAmount}` : (estimatedFare || "$15.00");
    const newTrip = {
      id: Date.now().toString(), clientId: user?.id, clientName: user?.name,
      pickup: pickupLocation, dropoff: dropoffLocation, fare, status: "requested",
      requestedAt: new Date().toISOString(), vehicleType: selectedVehicle,
      scheduledFor: scheduledDate && scheduledTime ? `${scheduledDate} ${scheduledTime}` : null,
      isBid: showBidMode, driver: null,
    };
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
    trips.push(newTrip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    setCurrentTrip(newTrip);
    setTripStatus("searching");
    addNotification(scheduledDate ? `📅 Viaje programado para ${scheduledDate} ${scheduledTime}` : "🔍 Buscando conductor disponible...", "info");
  };

  const handleCancelTrip = () => {
    if (currentTrip) {
      const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || "[]");
      localStorage.setItem(TRIPS_KEY, JSON.stringify(trips.filter((t: any) => t.id !== currentTrip.id)));
    }
    setTripStatus("idle"); setCurrentTrip(null);
    addNotification("Viaje cancelado", "warning");
  };

  const handleSubmitRating = () => {
    const newEntry: TripHistory = {
      id: currentTrip?.id || Date.now().toString(),
      date: new Date().toLocaleDateString("es"),
      from: currentTrip?.pickup || "", to: currentTrip?.dropoff || "",
      fare: currentTrip?.fare || "", driver: currentTrip?.driver?.name || "Conductor", rating: driverRating,
    };
    const history = [newEntry, ...tripHistory.slice(0, 19)];
    setTripHistory(history);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    setLoyaltyPoints(p => p + 50);
    toast.success("¡Gracias por tu calificación! +50 puntos");
    setTripStatus("idle"); setCurrentTrip(null); setDriverRating(0); setDriverComment("");
  };

  const handleCallDriver = () => {
    const phone = currentTrip?.driver?.phone || "+15550101";
    window.location.href = `tel:${phone}`;
  };

  const handleMessageDriver = () => {
    const phone = (currentTrip?.driver?.phone || "+15550101").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=Hola, soy tu pasajero. Ya estoy listo.`, "_blank");
  };

  const handleSOS = () => {
    const msg = `🚨 EMERGENCIA - Pasajero: ${user?.name} | Viaje: ${currentTrip?.pickup} → ${currentTrip?.dropoff} | Conductor: ${currentTrip?.driver?.name || "N/A"} | Placa: ${currentTrip?.driver?.plate || "N/A"}`;
    if (navigator.share) { navigator.share({ title: "SOS Emergencia", text: msg }); }
    else { navigator.clipboard.writeText(msg); toast.error("🚨 Info de emergencia copiada al portapapeles"); }
    addNotification("🚨 Alerta SOS enviada", "warning");
  };

  const handleShareTrip = () => {
    const text = `Estoy en un viaje con WhatsApp Taxi 🚕\nConductor: ${currentTrip?.driver?.name}\nVehículo: ${currentTrip?.driver?.vehicle} (${currentTrip?.driver?.plate})\nDesde: ${currentTrip?.pickup}\nHacia: ${currentTrip?.dropoff}`;
    if (navigator.share) { navigator.share({ title: "Compartir viaje", text }); }
    else { navigator.clipboard.writeText(text); toast.success("Información del viaje copiada"); }
  };

  const vehicles = [
    { id: "economy", label: "Económico", icon: "🚗", price: "$1.20/km", time: "3 min" },
    { id: "comfort", label: "Confort", icon: "🚙", price: "$1.80/km", time: "5 min" },
    { id: "premium", label: "Premium", icon: "🚘", price: "$2.50/km", time: "8 min" },
    { id: "suv", label: "SUV", icon: "🚐", price: "$3.00/km", time: "6 min" },
  ];

  const loyaltyLevel = loyaltyPoints < 200 ? { name: "Bronce", color: "text-amber-600", next: 200 } :
    loyaltyPoints < 500 ? { name: "Plata", color: "text-slate-400", next: 500 } :
    loyaltyPoints < 1000 ? { name: "Oro", color: "text-yellow-500", next: 1000 } :
    { name: "Platino", color: "text-purple-500", next: 9999 };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.[0] || "C"}</div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{user?.name}</p>
              <p className={`text-xs font-medium ${loyaltyLevel.color}`}>⭐ {loyaltyLevel.name} · {loyaltyPoints} pts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell size={20} className="text-slate-600" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.length > 9 ? "9+" : notifications.length}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 text-sm">Notificaciones</h3>
                    <button onClick={() => setNotifications([])} className="text-xs text-slate-500 hover:text-slate-700">Limpiar</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? <p className="p-4 text-sm text-slate-500 text-center">Sin notificaciones</p> :
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-100 flex gap-3 ${n.type === "success" ? "bg-green-50" : n.type === "warning" ? "bg-yellow-50" : "bg-blue-50"}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`} />
                          <div><p className="text-sm text-slate-800">{n.message}</p><p className="text-xs text-slate-500 mt-0.5">{n.time}</p></div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }} className="gap-1.5 text-xs"><LogOut size={14} /> Salir</Button>
          </div>
        </div>
      </header>

      {/* Main content — fills remaining height */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0" style={{ height: 'calc(100vh - 65px)' }}>

        {/* MAPA — altura explícita garantizada */}
        <div className="relative lg:flex-1" style={{ height: '45vw', minHeight: '220px', maxHeight: '320px' }}>
          {/* En desktop, ocupa todo el espacio restante */}
          <style>{`@media (min-width: 1024px) { .map-container { height: 100% !important; max-height: none !important; } }`}</style>
          <MapView
            initialCenter={{ lat: 19.4326, lng: -99.1332 }}
            initialZoom={13}
            onMapReady={handleMapReady}
            className="map-container absolute inset-0 w-full h-full"
          />
          {/* Chat flotante — visible cuando hay viaje activo */}
          {(tripStatus === "accepted" || tripStatus === "in_progress") && currentTrip && (
            <TripChat
              tripId={currentTrip.id}
              userId={user?.id != null ? String(user.id) : "client"}
              userName={user?.name || "Cliente"}
              role="client"
              otherPartyName={currentTrip.driver?.name || "Conductor"}
            />
          )}
          {/* Status overlay en el mapa */}
          {tripStatus === "searching" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-900">Buscando conductor...</span>
            </div>
          )}
          {(tripStatus === "accepted" || tripStatus === "in_progress") && currentTrip?.driver && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 z-10">
              <Car size={16} />
              <span className="text-sm font-semibold">{currentTrip.driver.name} · ETA {currentTrip.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Panel lateral derecho */}
        <div className="w-full lg:w-[400px] bg-white shadow-xl flex flex-col flex-shrink-0" style={{ flex: '1 1 auto', minHeight: 0, maxHeight: '100%' }}>

          {/* Tabs — solo en idle */}
          {tripStatus === "idle" && (
            <div className="flex border-b border-slate-200 flex-shrink-0">
              {[
                { id: "request" as ActivePanel, label: "Viaje", icon: Car },
                { id: "scheduled" as ActivePanel, label: "Programar", icon: Calendar },
                { id: "history" as ActivePanel, label: "Historial", icon: History },
                { id: "promo" as ActivePanel, label: "Promos", icon: Tag },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                  className={`flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${activePanel === tab.id ? "text-green-600 border-b-2 border-green-500" : "text-slate-500 hover:text-slate-700"}`}>
                  <tab.icon size={16} className="mb-0.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto pb-24 lg:pb-0">

            {/* SOLICITAR VIAJE */}
            {tripStatus === "idle" && activePanel === "request" && (
              <div className="p-4 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-slate-900">¿A dónde vamos?</h2>

                {/* Lugares guardados */}
                <div className="flex gap-2">
                  {[{ label: "Casa", icon: Home, addr: "Calle Principal 123" }, { label: "Trabajo", icon: Briefcase, addr: "Av. Reforma 456" }].map(p => (
                    <button key={p.label} onClick={() => setDropoffLocation(p.addr)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 transition-colors">
                      <p.icon size={11} /> {p.label}
                    </button>
                  ))}
                </div>

                {/* Pickup con autocompletado */}
                <PlacesAutocomplete
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  onSelect={handlePickupSelect}
                  placeholder="¿Desde dónde te recogemos?"
                  dotColor="green"
                  showLocationButton
                  onGetLocation={handleGetMyLocation}
                  gettingLocation={gettingLocation}
                />

                {/* Dropoff con autocompletado */}
                <PlacesAutocomplete
                  value={dropoffLocation}
                  onChange={setDropoffLocation}
                  onSelect={handleDropoffSelect}
                  placeholder="¿A dónde vas?"
                  dotColor="red"
                />

                {/* Tipo de vehículo */}
                <div>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tipo de vehículo</p>
                 <div className="grid grid-cols-2 gap-2">
                   {vehicles.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${selectedVehicle === v.id ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                      >
                        {/* Selected indicator */}
                        {selectedVehicle === v.id && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                        {/* Icon + label */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xl">{v.icon}</span>
                          <p className="text-xs font-bold text-slate-900">{v.label}</p>
                        </div>
                        {/* Price — show calculated fare or rate */}
                        {allFares[v.id] ? (
                          <p className={`text-base font-black ${selectedVehicle === v.id ? "text-green-700" : "text-slate-800"}`}>{allFares[v.id]}</p>
                        ) : (
                          <p className="text-xs text-slate-500">{v.price}</p>
                        )}
                        {/* ETA + availability */}
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${(vehicleAvailability[v.id]?.count ?? 0) > 0 ? "bg-green-500" : "bg-slate-300"}`} />
                          <p className="text-xs text-slate-500">
                            {(vehicleAvailability[v.id]?.count ?? 0) > 0
                              ? `${vehicleAvailability[v.id]?.count} disp · ${vehicleAvailability[v.id]?.eta}`
                              : "No disponible"}
                          </p>
                        </div>
                      </button>
                   ))}
                 </div>
                </div>

                {/* Modo puja */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Modo Puja (proponer precio)</label>
                  <button onClick={() => setShowBidMode(!showBidMode)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${showBidMode ? "bg-green-500" : "bg-slate-300"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showBidMode ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {showBidMode && (
                  <input type="number" placeholder="Tu oferta en USD ($)" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                )}

               {/* Estimación */}
               {isCalculatingRoute && (
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin flex-shrink-0" />
                   <span className="text-sm text-slate-500">Calculando ruta y tarifa...</span>
                 </div>
               )}
                {/* Tarifa estimada — se muestra siempre con valores base o calculados */}
                {!isCalculatingRoute && (
                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl overflow-hidden">
                   <div className="px-4 py-3 flex justify-between items-center border-b border-green-200">
                     <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                         <Car size={16} className="text-green-600" />
                       </div>
                       <div>
                         <p className="text-xs text-green-700 font-medium">{vehicles.find(v => v.id === selectedVehicle)?.label}</p>
                          <p className="text-xs text-green-600">{estimatedDistance ? `${estimatedDistance} · ${estimatedTime}` : "Selecciona destino para calcular"}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       {promoApplied && <span className="text-xs text-green-600 font-medium bg-green-200 px-1.5 py-0.5 rounded-full block mb-0.5">-15% PROMO</span>}
                        <span className="text-2xl font-black text-green-800">{estimatedFare || "~$8.00"}</span>
                        {!estimatedFare && <span className="text-xs text-green-600 block">estimado base</span>}
                     </div>
                   </div>
                   <div className="px-4 py-2 space-y-1">
                     <div className="flex justify-between text-xs text-green-700">
                       <span>Tarifa base</span><span>$2.50</span>
                     </div>
                     <div className="flex justify-between text-xs text-green-700">
                        <span>Distancia {estimatedDistance ? `(${estimatedDistance})` : "(por calcular)"}</span>
                        <span>{routeDistanceKm > 0 ? `$${(routeDistanceKm * ({ economy: 1.2, comfort: 1.8, premium: 2.5, suv: 3.0 }[selectedVehicle] || 1.2)).toFixed(2)}` : "—"}</span>
                     </div>
                     {promoApplied && (
                       <div className="flex justify-between text-xs text-green-600 font-medium">
                         <span>Descuento promocional</span><span>-15%</span>
                       </div>
                     )}
                     <div className="flex justify-between text-xs font-bold text-green-800 pt-1 border-t border-green-200">
                        <span>Total estimado</span><span>{estimatedFare || "~$8.00"}</span>
                     </div>
                   </div>
                    {pickupLocation && dropoffLocation && (
                      <div className="px-4 py-2 bg-green-100/60 flex items-center gap-2">
                        <MapPin size={12} className="text-green-600 flex-shrink-0" />
                        <p className="text-xs text-green-700 truncate">{pickupLocation} → {dropoffLocation}</p>
                      </div>
                    )}
                    {!pickupLocation && (
                      <div className="px-4 py-2 bg-blue-50 flex items-center gap-2">
                        <Navigation size={12} className="text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-blue-600">Ingresa origen y destino para ver el precio exacto</p>
                      </div>
                    )}
                 </div>
               )}

                {/* Lealtad */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold text-purple-800">Programa de Lealtad</p>
                    <p className={`text-xs font-bold ${loyaltyLevel.color}`}>{loyaltyLevel.name}</p>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((loyaltyPoints / loyaltyLevel.next) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-purple-600 mt-1">{loyaltyPoints} / {loyaltyLevel.next} pts</p>
                </div>
              </div>
            )}

            {/* PROGRAMAR VIAJE */}
            {tripStatus === "idle" && activePanel === "scheduled" && (
              <div className="p-4 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-slate-900">Programar Viaje</h2>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                  <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <PlacesAutocomplete value={pickupLocation} onChange={setPickupLocation} onSelect={handlePickupSelect} placeholder="¿Dónde te recogemos?" dotColor="green" />
                <PlacesAutocomplete value={dropoffLocation} onChange={setDropoffLocation} onSelect={handleDropoffSelect} placeholder="¿A dónde vas?" dotColor="red" />
                <Button onClick={() => { if (scheduledDate && scheduledTime && pickupLocation && dropoffLocation) { handleRequestTrip(); setActivePanel("request"); } else { toast.error("Completa todos los campos"); } }}
                  className="w-full py-3 font-bold" style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
                  <Calendar size={15} className="mr-2" /> Programar Viaje
                </Button>
              </div>
            )}

            {/* HISTORIAL */}
            {tripStatus === "idle" && activePanel === "history" && (
              <div className="p-4 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-slate-900">Historial de Viajes</h2>
                {tripHistory.length === 0 ? (
                  <div className="text-center py-10"><History size={40} className="mx-auto text-slate-300 mb-3" /><p className="text-slate-500 text-sm">No hay viajes aún</p></div>
                ) : tripHistory.map(trip => (
                  <div key={trip.id} className="border border-slate-200 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-xs text-slate-500">{trip.date}</p><p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{trip.from} → {trip.to}</p></div>
                      <div className="text-right"><p className="font-bold text-green-600">{trip.fare}</p>
                        <div className="flex items-center gap-0.5 justify-end">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= trip.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} />)}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Conductor: {trip.driver}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => { setPickupLocation(trip.from); setDropoffLocation(trip.to); setActivePanel("request"); }}>Repetir viaje</Button>
                  </div>
                ))}
              </div>
            )}

            {/* PROMOS */}
            {tripStatus === "idle" && activePanel === "promo" && (
              <div className="p-4 flex flex-col gap-3">
                <h2 className="text-lg font-bold text-slate-900">Códigos Promocionales</h2>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ingresa tu código" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none uppercase" />
                  <Button onClick={handleApplyPromo} className="bg-green-500 hover:bg-green-600 text-white">Aplicar</Button>
                </div>
                {promoApplied && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-sm text-green-800 font-medium">¡Código aplicado! 15% de descuento</p>
                  </div>
                )}
                <div className="space-y-2">
                  {[{ code: "BIENVENIDO", desc: "15% para nuevos usuarios" }, { code: "TAXI10", desc: "10% en viajes al aeropuerto" }, { code: "PROMO20", desc: "20% en tu primer viaje Premium" }].map(c => (
                    <div key={c.code} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                      <div><p className="font-mono font-bold text-slate-900 text-sm">{c.code}</p><p className="text-xs text-slate-500">{c.desc}</p></div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setPromoCode(c.code)}>Usar</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUSCANDO */}
            {tripStatus === "searching" && (
              <div className="p-5 flex flex-col items-center gap-4 justify-center h-full">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Car size={36} className="text-green-600 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Buscando conductor...</h3>
                <div className="bg-slate-50 rounded-xl p-4 w-full text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Recogida</span><span className="font-medium text-slate-900 text-right max-w-[60%] truncate">{currentTrip?.pickup}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Destino</span><span className="font-medium text-slate-900 text-right max-w-[60%] truncate">{currentTrip?.dropoff}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tarifa</span><span className="font-bold text-green-600">{currentTrip?.fare}</span></div>
                </div>
                <Button variant="outline" onClick={handleCancelTrip} className="w-full text-red-500 border-red-200 hover:bg-red-50"><X size={16} className="mr-2" /> Cancelar</Button>
              </div>
            )}

            {/* CONDUCTOR ACEPTÓ */}
            {(tripStatus === "accepted" || tripStatus === "in_progress") && currentTrip?.driver && (
              <div className="p-4 flex flex-col gap-3">
                <div className={`flex items-center gap-2 rounded-xl p-3 ${tripStatus === "accepted" ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}>
                  <CheckCircle size={18} className={tripStatus === "accepted" ? "text-green-600" : "text-blue-600"} />
                  <p className={`text-sm font-semibold ${tripStatus === "accepted" ? "text-green-800" : "text-blue-800"}`}>
                    {tripStatus === "accepted" ? "¡Conductor en camino!" : "Viaje en progreso"}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-50 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">{currentTrip.driver.name[0]}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{currentTrip.driver.name}</p>
                      <p className="text-sm text-slate-500">{currentTrip.driver.vehicle}</p>
                      <p className="text-xs font-mono text-slate-400">Placa: {currentTrip.driver.plate}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star size={13} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-yellow-700">{currentTrip.driver.rating}</span>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-3 border-t border-slate-200">
                    <div className="flex items-center gap-2"><Clock size={15} className="text-slate-400" /><div><p className="text-xs text-slate-500">ETA en tiempo real</p><p className="font-bold text-slate-900 text-sm">{driverEta || currentTrip.estimatedTime}</p></div></div>
                    {driverDistance && (
                    <div className="flex items-center gap-2"><Navigation size={15} className="text-blue-400" /><div><p className="text-xs text-slate-500">Distancia</p><p className="font-bold text-blue-600 text-sm">{driverDistance}</p></div></div>
                    )}
                    {!driverDistance && (
                    <div className="flex items-center gap-2"><DollarSign size={15} className="text-slate-400" /><div><p className="text-xs text-slate-500">Tarifa</p><p className="font-bold text-green-600 text-sm">{currentTrip.fare}</p></div></div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleCallDriver} className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"><Phone size={15} /> Llamar</Button>
                  <Button onClick={handleMessageDriver} className="bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2 text-sm"><MessageCircle size={15} /> WhatsApp</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={handleShareTrip} className="gap-1 text-xs"><Share2 size={12} /> Compartir</Button>
                  <Button variant="outline" size="sm" onClick={handleSOS} className="gap-1 text-xs text-red-500 border-red-200"><AlertTriangle size={12} /> SOS</Button>
                  <Button variant="outline" size="sm" onClick={handleCancelTrip} className="gap-1 text-xs text-slate-500"><X size={12} /> Cancelar</Button>
                </div>
                {tripStatus === "in_progress" && (
                  <Button onClick={() => setTripStatus("rating")} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <CheckCircle size={16} /> Finalizar Viaje
                  </Button>
                )}
              </div>
            )}

            {/* CALIFICACIÓN */}
            {tripStatus === "rating" && (
              <div className="p-5 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-slate-900">Califica tu viaje</h2>
                <p className="text-sm text-slate-500">¿Cómo fue tu experiencia con {currentTrip?.driver?.name}?</p>
                <div className="flex justify-center gap-3 py-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setDriverRating(s)}>
                      <Star size={38} className={`transition-all ${s <= driverRating ? "text-yellow-500 fill-yellow-500 scale-110" : "text-slate-300 hover:text-yellow-400"}`} />
                    </button>
                  ))}
                </div>
                <textarea placeholder="Comentario opcional..." value={driverComment} onChange={(e) => setDriverComment(e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <p className="text-sm text-purple-800 font-medium">+50 puntos de lealtad al calificar</p>
                </div>
                <Button onClick={handleSubmitRating} disabled={driverRating === 0} className="w-full py-3 font-bold"
                  style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>Enviar Calificación</Button>
                <Button variant="outline" onClick={() => { setTripStatus("idle"); setCurrentTrip(null); }} className="w-full text-slate-500">Omitir</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Botón fijo en la parte inferior — solo visible en móvil cuando el panel de solicitud está activo */}
      {tripStatus === "idle" && activePanel === "request" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-4 shadow-2xl">
          <Button onClick={handleRequestTrip} className="w-full py-4 font-bold text-base rounded-xl shadow-lg"
            style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}>
            {showBidMode ? "Enviar Oferta" : "🚕 Solicitar Viaje"} <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
