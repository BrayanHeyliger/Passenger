import { useEffect, useRef, useState } from "react";

export interface LeafletMapRef {
  setPickup: (lat: number, lng: number, label: string) => void;
  setDropoff: (lat: number, lng: number, label: string) => void;
  clearRoute: () => void;
  getRoute: () => Promise<{ distanceKm: number; durationMin: number } | null>;
  spawnVehicles: (lat: number, lng: number) => void;
  panTo: (lat: number, lng: number) => void;
  updateVehiclePosition: (lat: number, lng: number, heading?: number) => void;
}

interface Props {
  height?: string;
  onMapReady?: (ref: LeafletMapRef) => void;
  className?: string;
  showNearbyVehicles?: boolean;
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

const vehicleIcon = (L: any, heading = 0) =>
  L.divIcon({
    html: `<span class="passenger-map-vehicle" aria-label="Vehículo disponible" style="--vehicle-heading:${heading}deg"><svg viewBox="0 0 48 28" role="img"><path d="M8 18 12 8h23l6 10v5H8z"/><path d="m15 8 3-5h12l5 5"/><circle cx="15" cy="23" r="3"/><circle cx="35" cy="23" r="3"/></svg></span>`,
    className: "passenger-map-icon",
    iconAnchor: [20, 14],
  });

export default function LeafletMap({
  height = "100%",
  onMapReady,
  className = "",
  showNearbyVehicles = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const vehicleMarkersRef = useRef<any[]>([]);
  const vehicleAnimRef = useRef<any>(null);
  const routeVehicleMarkerRef = useRef<any>(null);
  const routeAnimationRef = useRef<number | null>(null);
  const routePointsRef = useRef<Array<[number, number]>>([]);
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
      map.setView([28.5436, -81.3733], 13);
      mapRef.current = map;

      const stopRouteAnimation = () => {
        if (routeAnimationRef.current !== null) {
          cancelAnimationFrame(routeAnimationRef.current);
          routeAnimationRef.current = null;
        }
      };

      const bearingBetween = (from: [number, number], to: [number, number]) => {
        const dLon = ((to[1] - from[1]) * Math.PI) / 180;
        const fromLat = (from[0] * Math.PI) / 180;
        const toLat = (to[0] * Math.PI) / 180;
        return (
          (Math.atan2(
            Math.sin(dLon) * Math.cos(toLat),
            Math.cos(fromLat) * Math.sin(toLat) -
              Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLon)
          ) *
            180) /
          Math.PI
        );
      };

      const startRouteAnimation = (
        points: Array<[number, number]>,
        distanceMeters: number
      ) => {
        stopRouteAnimation();
        routePointsRef.current = points;
        if (points.length < 2) return;
        const initialHeading = bearingBetween(points[0], points[1]);
        if (routeVehicleMarkerRef.current)
          routeVehicleMarkerRef.current.remove();
        routeVehicleMarkerRef.current = L.marker(points[0], {
          icon: vehicleIcon(L, initialHeading),
          keyboard: false,
          zIndexOffset: 700,
        }).addTo(map);
        const duration = Math.min(
          24000,
          Math.max(10000, (distanceMeters / 1000) * 1600)
        );
        const startedAt = performance.now();
        const easeInOut = (value: number) =>
          value < 0.5
            ? 4 * value * value * value
            : 1 - Math.pow(-2 * value + 2, 3) / 2;
        const tick = (now: number) => {
          const cycle = ((now - startedAt) % duration) / duration;
          const eased = easeInOut(cycle);
          const scaled = eased * (points.length - 1);
          const index = Math.min(points.length - 2, Math.floor(scaled));
          const local = scaled - index;
          const from = points[index];
          const to = points[index + 1];
          const position: [number, number] = [
            from[0] + (to[0] - from[0]) * local,
            from[1] + (to[1] - from[1]) * local,
          ];
          const heading = bearingBetween(from, to);
          routeVehicleMarkerRef.current?.setLatLng(position);
          if (
            routeVehicleMarkerRef.current &&
            Math.round(cycle * 100) % 4 === 0
          )
            routeVehicleMarkerRef.current.setIcon(vehicleIcon(L, heading));
          routeAnimationRef.current = requestAnimationFrame(tick);
        };
        routeAnimationRef.current = requestAnimationFrame(tick);
      };

      const updateVehiclePosition = (
        lat: number,
        lng: number,
        heading?: number
      ) => {
        stopRouteAnimation();
        if (!routeVehicleMarkerRef.current)
          routeVehicleMarkerRef.current = L.marker([lat, lng], {
            icon: vehicleIcon(L, heading ?? 0),
            keyboard: false,
            zIndexOffset: 700,
          }).addTo(map);
        routeVehicleMarkerRef.current.setLatLng([lat, lng]);
        if (typeof heading === "number")
          routeVehicleMarkerRef.current.setIcon(vehicleIcon(L, heading));
      };

      const spawnVehiclesInternal = (lat: number, lng: number) => {
        vehicleMarkersRef.current.forEach(marker => marker.remove());
        vehicleMarkersRef.current = [];
        if (!showNearbyVehicles) return;
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
        () => spawnVehiclesInternal(28.5436, -81.3733)
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
              const routeCasing = L.geoJSON(route.geometry, {
                style: {
                  color: "#071912",
                  weight: 14,
                  opacity: 0.86,
                  lineCap: "round",
                  lineJoin: "round",
                },
              });
              const routeCore = L.geoJSON(route.geometry, {
                style: {
                  color: "#48e894",
                  weight: 7,
                  opacity: 0.98,
                  lineCap: "round",
                  lineJoin: "round",
                },
              });
              routeLayerRef.current = L.layerGroup([
                routeCasing,
                routeCore,
              ]).addTo(map);
              const routePoints = route.geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
              );
              startRouteAnimation(routePoints, route.distance);
              map.fitBounds(routeCore.getBounds(), {
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
        updateVehiclePosition,
      };
      onMapReady?.(ref);
    });

    return () => {
      if (vehicleAnimRef.current) clearInterval(vehicleAnimRef.current);
      if (routeAnimationRef.current !== null)
        cancelAnimationFrame(routeAnimationRef.current);
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
          DOWNTOWN
        </span>
        <span className="passenger-map-street-label passenger-map-street-label--east">
          LAKE EOLA
        </span>
        <span className="passenger-map-street-label passenger-map-street-label--center">
          MILLS 50
        </span>
        <span className="passenger-map-street-label passenger-map-street-label--south">
          SODO
        </span>
      </div>
      {!ready && <div className="passenger-map-loading">Cargando mapa...</div>}
    </div>
  );
}
