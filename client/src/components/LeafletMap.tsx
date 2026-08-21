import { useEffect, useRef, useState } from "react";

export interface LeafletMapRef {
  setPickup: (lat: number, lng: number, label: string) => void;
  setDropoff: (lat: number, lng: number, label: string) => void;
  clearRoute: () => void;
  getRoute: () => Promise<{ distanceKm: number; durationMin: number } | null>;
  spawnVehicles: (lat: number, lng: number) => void;
  panTo: (lat: number, lng: number) => void;
}

interface Props {
  height?: string;
  onMapReady?: (ref: LeafletMapRef) => void;
  className?: string;
}

const pickupIcon = (L: any) =>
  L.divIcon({
    html: '<span class="passenger-map-pin passenger-map-pin--pickup"><i></i></span>',
    className: "passenger-map-icon",
    iconAnchor: [18, 18],
  });

const dropoffIcon = (L: any) =>
  L.divIcon({
    html: '<span class="passenger-map-pin passenger-map-pin--dropoff"><i></i></span>',
    className: "passenger-map-icon",
    iconAnchor: [18, 18],
  });

const vehicleIcon = (L: any) =>
  L.divIcon({
    html: '<span class="passenger-map-vehicle" aria-label="Vehículo disponible"><svg viewBox="0 0 48 28" role="img"><path d="M8 18 12 8h23l6 10v5H8z"/><path d="m15 8 3-5h12l5 5"/><circle cx="15" cy="23" r="3"/><circle cx="35" cy="23" r="3"/></svg></span>',
    className: "passenger-map-icon",
    iconAnchor: [20, 14],
  });

export default function LeafletMap({
  height = "100%",
  onMapReady,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const vehicleMarkersRef = useRef<any[]>([]);
  const vehicleAnimRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let L: any;

    import("leaflet").then(mod => {
      L = mod.default;
      const map = L.map(containerRef.current!, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          subdomains: "abcd",
          attribution: "© OpenStreetMap © CARTO",
        }
      ).addTo(map);
      map.setView([19.4326, -99.1332], 13);
      mapRef.current = map;

      const spawnVehiclesInternal = (lat: number, lng: number) => {
        vehicleMarkersRef.current.forEach(marker => marker.remove());
        vehicleMarkersRef.current = [];
        for (let i = 0; i < 8; i++) {
          const spread = 0.012;
          const vLat = lat + (Math.random() - 0.5) * spread;
          const vLng = lng + (Math.random() - 0.5) * spread;
          const marker = L.marker([vLat, vLng], {
            icon: vehicleIcon(L),
            keyboard: false,
          }).addTo(map);
          vehicleMarkersRef.current.push(marker);
        }
        if (vehicleAnimRef.current) clearInterval(vehicleAnimRef.current);
        vehicleAnimRef.current = setInterval(() => {
          vehicleMarkersRef.current.forEach(marker => {
            const pos = marker.getLatLng();
            marker.setLatLng([
              pos.lat + (Math.random() - 0.5) * 0.0003,
              pos.lng + (Math.random() - 0.5) * 0.0003,
            ]);
          });
        }, 1500);
      };

      navigator.geolocation?.getCurrentPosition(
        pos => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15);
          pickupMarkerRef.current = L.marker(
            [pos.coords.latitude, pos.coords.longitude],
            { icon: pickupIcon(L) }
          )
            .addTo(map)
            .bindPopup("Tu ubicación");
          spawnVehiclesInternal(pos.coords.latitude, pos.coords.longitude);
        },
        () => spawnVehiclesInternal(19.4326, -99.1332)
      );

      setReady(true);

      const ref: LeafletMapRef = {
        setPickup: (lat, lng, label) => {
          if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
          pickupMarkerRef.current = L.marker([lat, lng], {
            icon: pickupIcon(L),
          })
            .addTo(map)
            .bindPopup(label);
          map.setView([lat, lng], 15);
          spawnVehiclesInternal(lat, lng);
        },
        setDropoff: (lat, lng, label) => {
          if (dropoffMarkerRef.current) dropoffMarkerRef.current.remove();
          dropoffMarkerRef.current = L.marker([lat, lng], {
            icon: dropoffIcon(L),
          })
            .addTo(map)
            .bindPopup(label);
        },
        clearRoute: () => {
          if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
          }
        },
        getRoute: async () => {
          if (!pickupMarkerRef.current || !dropoffMarkerRef.current)
            return null;
          const pickup = pickupMarkerRef.current.getLatLng();
          const dropoff = dropoffMarkerRef.current.getLatLng();
          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            if (data.routes?.[0]) {
              const route = data.routes[0];
              if (routeLayerRef.current) routeLayerRef.current.remove();
              routeLayerRef.current = L.geoJSON(route.geometry, {
                style: {
                  color: "#48e894",
                  weight: 7,
                  opacity: 0.96,
                  lineCap: "round",
                  lineJoin: "round",
                },
              }).addTo(map);
              map.fitBounds(routeLayerRef.current.getBounds(), {
                padding: [44, 44],
              });
              return {
                distanceKm: route.distance / 1000,
                durationMin: Math.ceil(route.duration / 60),
              };
            }
          } catch {
            return null;
          }
          return null;
        },
        spawnVehicles: (lat, lng) => spawnVehiclesInternal(lat, lng),
        panTo: (lat, lng) => map.setView([lat, lng], 15),
      };
      onMapReady?.(ref);
    });

    return () => {
      if (vehicleAnimRef.current) clearInterval(vehicleAnimRef.current);
      mapRef.current?.remove?.();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`passenger-leaflet-map ${className}`}
      style={{ height, width: "100%" }}
    >
      <div className="passenger-map-street-grid" aria-hidden="true" />
      <div className="passenger-map-street-labels" aria-hidden="true">
        <span className="passenger-map-street-label passenger-map-street-label--north">
          JUÁREZ
        </span>
        <span className="passenger-map-street-label passenger-map-street-label--east">
          ROMA NORTE
        </span>
        <span className="passenger-map-street-label passenger-map-street-label--center">
          CUAUHTÉMOC
        </span>
        <span className="passenger-map-street-label passenger-map-street-label--south">
          DOCTORES
        </span>
      </div>
      {!ready && <div className="passenger-map-loading">Cargando mapa...</div>}
    </div>
  );
}
