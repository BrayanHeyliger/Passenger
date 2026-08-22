import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const mapSource = readFileSync(
  resolve(projectRoot, "client/src/components/LeafletMap.tsx"),
  "utf8"
);
const tripSource = readFileSync(
  resolve(projectRoot, "client/src/components/LiveTripNavigationMap.tsx"),
  "utf8"
);
const cssSource = readFileSync(
  resolve(projectRoot, "client/src/index.css"),
  "utf8"
);
const referenceSource = readFileSync(
  resolve(projectRoot, "client/src/pages/ReferencePerfectTripTrackingPage.tsx"),
  "utf8"
);
const functionalSource = readFileSync(
  resolve(
    projectRoot,
    "client/src/pages/FunctionalReferenceTripTrackingPage.tsx"
  ),
  "utf8"
);
const flowSource = readFileSync(
  resolve(projectRoot, "client/src/pages/TripFlowPreviewPage.tsx"),
  "utf8"
);
const rideSelectionSource = readFileSync(
  resolve(projectRoot, "client/src/pages/RideSelectionProposalPage.tsx"),
  "utf8"
);
const landingRideSource = readFileSync(
  resolve(projectRoot, "client/src/pages/LandingRideProposalPage.tsx"),
  "utf8"
);
const heroSource = readFileSync(
  resolve(projectRoot, "client/src/components/HeroSection.tsx"),
  "utf8"
);
const overlayDemoSource = readFileSync(
  resolve(projectRoot, "client/src/pages/RideOverlayDemoPage.tsx"),
  "utf8"
);
const heroTrackingBackdropSource = readFileSync(
  resolve(projectRoot, "client/src/components/HeroTrackingBackdrop.tsx"),
  "utf8"
);
const tripRequestSource = readFileSync(
  resolve(projectRoot, "client/src/pages/TripRequestPage.tsx"),
  "utf8"
);
const functionalTrackingSource = readFileSync(
  resolve(
    projectRoot,
    "client/src/pages/FunctionalReferenceTripTrackingPage.tsx"
  ),
  "utf8"
);
const serverSource = readFileSync(
  resolve(projectRoot, "server/_core/index.ts"),
  "utf8"
);
const paymentsSource = readFileSync(
  resolve(projectRoot, "server/routers/payments.ts"),
  "utf8"
);
const clientDashboardSource = readFileSync(
  resolve(projectRoot, "client/src/pages/ClientDashboard.tsx"),
  "utf8"
);
const driverDashboardSource = readFileSync(
  resolve(projectRoot, "client/src/pages/DriverDashboard.tsx"),
  "utf8"
);
const authBrandSource = readFileSync(
  resolve(projectRoot, "client/src/components/SayTaxiBrand.tsx"),
  "utf8"
);
const passengerTrackingSource = readFileSync(
  resolve(projectRoot, "client/src/pages/PassengerTripTrackingPage.tsx"),
  "utf8"
);
const appSource = readFileSync(resolve(projectRoot, "client/src/App.tsx"), "utf8");
const socketSource = readFileSync(
  resolve(projectRoot, "client/src/hooks/useSocket.ts"),
  "utf8"
);
const rideOverlayCssSource = readFileSync(
  resolve(projectRoot, "client/src/pages/ride-overlay-demo.css"),
  "utf8"
);
const tripActionDockSource = readFileSync(
  resolve(projectRoot, "client/src/components/TripActionDock.tsx"),
  "utf8"
);
const pushNotificationsSource = readFileSync(
  resolve(projectRoot, "client/src/hooks/usePushNotifications.ts"),
  "utf8"
);
const tripChatSource = readFileSync(
  resolve(projectRoot, "client/src/components/TripChat.tsx"),
  "utf8"
);
const serviceWorkerSource = readFileSync(
  resolve(projectRoot, "client/public/sw.js"),
  "utf8"
);
const trustBadgesSource = readFileSync(
  resolve(projectRoot, "client/src/components/TrustBadges.tsx"),
  "utf8"
);
const adminDashboardSource = readFileSync(
  resolve(projectRoot, "client/src/pages/AdminDashboard.tsx"),
  "utf8"
);
const siteConfigSource = readFileSync(
  resolve(projectRoot, "client/src/contexts/SiteConfigContext.tsx"),
  "utf8"
);

describe("mapa dark premium de referencia", () => {
  it("mantiene el mapa urbano dark, la ruta y los marcadores funcionales", () => {
    expect(mapSource).toContain("basemaps.cartocdn.com/rastertiles/voyager");
    expect(mapSource).toContain("router.project-osrm.org/route/v1/driving");
    expect(mapSource).toContain("passenger-map-pin--pickup");
    expect(mapSource).toContain("passenger-map-pin--dropoff");
    expect(mapSource).toContain("passenger-map-vehicle");
    expect(mapSource).toContain("passenger-map-street-grid");
    expect(mapSource).toContain("requestAnimationFrame");
    expect(mapSource).toContain("bearingBetween");
    expect(mapSource).toContain("updateVehiclePosition");
    expect(mapSource).toContain("LAKE EOLA");
    expect(mapSource).toContain('color: "#48e894"');
    expect(mapSource).toContain('color: "#071912"');
  });

  it("incluye las tarjetas flotantes del viaje en curso", () => {
    expect(tripSource).toContain("passenger-map-route-card");
    expect(tripSource).toContain("passenger-map-pickup-card");
    expect(tripSource).toContain("passenger-map-destination-card");
    expect(tripSource).toContain("Seguimiento GPS en tiempo real");
    expect(tripSource).toContain("panTo(28.5436, -81.3733)");
    expect(tripSource).toContain("liveLocation");
    expect(tripSource).toContain("showNearbyVehicles={false}");
  });

  it("define tratamiento visual y responsive para el mapa", () => {
    expect(cssSource).toContain(".passenger-leaflet-map");
    expect(cssSource).toContain(".passenger-map-pin--dropoff");
    expect(cssSource).toContain("@media (max-width: 720px)");
  });

  it("conserva la composición aprobada de referencia en la ruta visual exacta", () => {
    expect(referenceSource).toContain("passenger-trip-reference.png");
    expect(referenceSource).toContain("reference-trip-hotspot--share");
    expect(cssSource).toContain(".reference-trip-canvas");
    expect(cssSource).toContain(".reference-trip-hotspot--driver");
  });

  it("implementa un mapa de seguimiento funcional sin depender de una imagen fija", () => {
    expect(functionalSource).toContain("ControlledStreetMap");
    expect(functionalSource).toContain("animateMotion");
    expect(functionalSource).toContain("routePath");
    expect(functionalSource).toContain("functional-map-marker--pickup");
    expect(functionalSource).toContain("functional-map-marker--destination");
    expect(functionalSource).toContain("driverLocation");
    expect(functionalSource).toContain("useSocket");
    expect(cssSource).toContain(".functional-map-shell");
  });

  it("presenta todos los estados visuales del flujo de viaje", () => {
    expect(flowSource).toContain("Solicita tu viaje");
    expect(flowSource).toContain("Conductor asignado");
    expect(flowSource).toContain("Tu viaje está en curso");
    expect(flowSource).toContain("Llegaste con seguridad");
    expect(flowSource).toContain("Califica tu experiencia");
    expect(cssSource).toContain(".trip-flow-preview");
  });

  it("incluye reglas de adaptación táctil para flujo y seguimiento", () => {
    expect(flowSource).toContain('"./trip-flow-responsive.css"');
    expect(functionalSource).toContain('"./trip-flow-responsive.css"');
    expect(functionalSource).toContain("functional-mobile-map");
  });

  it("ofrece una propuesta amplia y seleccionable para elegir el tipo de ride", () => {
    expect(rideSelectionSource).toContain("¿Cómo quieres viajar hoy?");
    expect(rideSelectionSource).toContain("UnPasajero XL");
    expect(rideSelectionSource).toContain("Continuar");
  });

  it("integra el selector amplio dentro de una propuesta de página inicial", () => {
    expect(landingRideSource).toContain("Tu próximo viaje empieza");
    expect(landingRideSource).toContain("SOLICITA UN RIDE");
    expect(landingRideSource).toContain("UnPasajero.Com");
  });

  it("aplica el selector amplio al hero oficial sin cambiar su flujo de solicitud", () => {
    expect(heroSource).toContain("landing-hero-ride-options");
    expect(heroSource).toContain("Continuar con");
    expect(heroSource).toContain("handleCalculate");
  });

  it("evita repetir las opciones de ride después de la selección del hero", () => {
    expect(heroSource).not.toContain("VEHICLES.map(vh");
    expect(heroSource).toContain("landing-estimate-summary");
    expect(heroSource).toContain("Cambiar ride");
  });

  it("mantiene el selector del hero compacto sin eliminar sus controles principales", () => {
    const compactSelectorCss = readFileSync(
      resolve(projectRoot, "client/src/components/HeroRideSelector.css"),
      "utf8"
    );
    expect(compactSelectorCss).toContain("min-height: 62px");
    expect(compactSelectorCss).toContain("passenger-reference-map");
    expect(heroSource).toContain("handleCalculate");
  });

  it("incluye una demo de panel superpuesto sin desplazamiento de landing", () => {
    expect(overlayDemoSource).toContain("ride-overlay-sheet");
    expect(overlayDemoSource).toContain('setStage("summary")');
    expect(overlayDemoSource).toContain("routeSummary");
  });

  it("centra el selector de ride en móvil en lugar de anclarlo al borde inferior", () => {
    expect(rideOverlayCssSource).toContain("max-height: calc(100svh - 32px)");
    expect(rideOverlayCssSource).toContain("width: min(510px, calc(100vw - 32px))");
    expect(rideOverlayCssSource).toContain("align-items: center");
    expect(rideOverlayCssSource).not.toContain("border-radius: 25px 25px 0 0");
  });

  it("integra el fondo de seguimiento con ruta verde y vehículo en el hero", () => {
    expect(heroSource).toContain("HeroTrackingBackdrop");
    expect(heroTrackingBackdropSource).toContain("heroRouteGlow");
    expect(heroTrackingBackdropSource).toContain("animateMotion");
    expect(heroTrackingBackdropSource).toContain("LAKE EOLA");
  });

  it("usa el hero de panel superpuesto como portada oficial sin alterar las secciones posteriores", () => {
    const homeSource = readFileSync(
      resolve(projectRoot, "client/src/pages/Home.tsx"),
      "utf8"
    );
    expect(homeSource).toContain("RideOverlayDemoPage integrated");
    expect(homeSource).toContain("ForClientsSection");
    expect(overlayDemoSource).toContain("pendingTrip");
  });

  it("restaura direcciones editables y persiste la solicitud creada desde la portada", () => {
    expect(overlayDemoSource).toContain("NominatimAutocomplete");
    expect(overlayDemoSource).toContain("unpasajeroActiveTrip");
    expect(overlayDemoSource).toContain("trip-request?tripId");
    expect(tripRequestSource).toContain("Elige a tu conductor");
    expect(tripRequestSource).toContain("Conductores disponibles cerca de ti");
    expect(tripRequestSource).toContain("Autobúsqueda");
    expect(tripRequestSource).toContain("Ver viaje en curso");
    expect(functionalTrackingSource).toContain("loadActiveTrip");
    expect(functionalTrackingSource).toContain("roomId: trip?.id");
    expect(serverSource).toContain('app.post("/api/auth"');
    expect(serverSource).toContain("DEMO_AUTH_ENABLED");
    expect(paymentsSource).toContain("function getStripe()");
    expect(clientDashboardSource).toContain("onClick={handleRequestTrip}");
    expect(clientDashboardSource).toContain("const activeTrip = trips.find");
    expect(clientDashboardSource).toContain("handleCreateParcel");
    expect(driverDashboardSource).toContain("forceOpen={driverChatOpen}");
    expect(authBrandSource).toContain("UnPasajero");
  });

  it("usa la sesión compacta como seguimiento principal con mapa, GPS y chat", () => {
    expect(passengerTrackingSource).toContain("ControlledStreetMap");
    expect(passengerTrackingSource).toContain("Tu conductor está");
    expect(passengerTrackingSource).toContain("TripChat");
    expect(passengerTrackingSource).toContain("trackingRoomId");
    expect(appSource).toContain('path={"/trip-tracking"}');
    expect(appSource).toContain("component={PassengerTripTrackingPage}");
  });

  it("pide ubicación exacta y limita las sugerencias del hero al entorno del pasajero", () => {
    expect(overlayDemoSource).toContain("handleUseExactLocation");
    expect(overlayDemoSource).toContain("enableHighAccuracy: true");
    expect(overlayDemoSource).toContain("countryCode=\"us\"");
    expect(overlayDemoSource).toContain("viewbox={nearbyViewbox}");
    expect(overlayDemoSource).toContain("Ubicación lista · ahora elige tu destino");
    expect(overlayDemoSource).toContain('setLocationActionState("success")');
  });

  it("deja el destino abierto y cotiza a partir de la ruta real seleccionada", () => {
    expect(overlayDemoSource).toContain('const [destination, setDestination] = useState("")');
    expect(overlayDemoSource).toContain("router.project-osrm.org/route/v1/driving");
    expect(overlayDemoSource).toContain("approximateDistanceKm");
    expect(overlayDemoSource).toContain("routeEstimate.distanceKm");
    expect(overlayDemoSource).toContain("Ingresa tu ubicación exacta");
    expect(rideOverlayCssSource).toContain(".ride-overlay-locations span:focus-within");
  });

  it("configura Socket.IO con URL de producción opcional y mantiene paneles en carga diferida", () => {
    expect(socketSource).toContain("VITE_REALTIME_URL");
    expect(socketSource).toContain("realtimeToken");
    expect(appSource).toContain("lazy(() => import(\"./pages/ClientDashboard\"))");
    expect(appSource).toContain("<Suspense fallback=");
  });

  it("reduce la repetición de contenido y concentra acciones de viaje en un menú inferior", () => {
    expect(clientDashboardSource).toContain("TripActionDock");
    expect(clientDashboardSource).toContain("Usa el menú inferior");
    expect(tripActionDockSource).toContain("Abrir chat");
    expect(tripActionDockSource).toContain("Enviar alerta SOS");
    expect(tripActionDockSource).toContain("Compartir viaje");
    expect(cssSource).toContain(".trip-action-dock-button");
  });

  it("añade alertas sonoras, GPS real del conductor y navegación externa", () => {
    const soundSource = readFileSync(
      resolve(projectRoot, "client/src/hooks/useInteractionSounds.ts"),
      "utf8"
    );
    expect(soundSource).toContain("startIncomingTripAlert");
    expect(soundSource).toContain("10000");
    expect(soundSource).toContain("startCallTone");
    expect(clientDashboardSource).toContain("playReservationConfirmed");
    expect(clientDashboardSource).toContain("driverLocation");
    expect(clientDashboardSource).toContain("updateVehiclePosition");
    expect(clientDashboardSource).toContain("Esperando GPS del conductor");
    expect(clientDashboardSource).toContain("qaSimulation");
    expect(driverDashboardSource).toContain("Google Maps");
    expect(driverDashboardSource).toContain("Apple Maps");
    expect(driverDashboardSource).toContain("Waze");
    expect(driverDashboardSource).toContain("startIncomingTripAlert");
  });

  it("envía avisos de sistema por rol únicamente cuando la pestaña está en segundo plano", () => {
    expect(pushNotificationsSource).toContain("unpasajero_push_preferences_${role}");
    expect(pushNotificationsSource).toContain('"trips" | "messages" | "status"');
    expect(pushNotificationsSource).toContain('document.visibilityState !== "hidden"');
    expect(pushNotificationsSource).toContain('navigator.serviceWorker.register("/sw.js")');
    expect(clientDashboardSource).toContain('usePushNotifications("client")');
    expect(driverDashboardSource).toContain('usePushNotifications("driver")');
    expect(driverDashboardSource).toContain('channel: "trips"');
    expect(tripChatSource).toContain('channel: "messages"');
    expect(tripChatSource).toContain("lastNotifiedMessageRef");
    expect(serviceWorkerSource).toContain('"UnPasajero.Com"');
    expect(serviceWorkerSource).toContain("notificationclick");
  });

  it("mantiene pago directo al conductor, selección manual y Autobúsqueda", () => {
    expect(clientDashboardSource).toContain("direct_to_driver");
    expect(clientDashboardSource).toContain("NEARBY_DRIVERS");
    expect(clientDashboardSource).toContain("Elige tu conductor");
    expect(clientDashboardSource).toContain("Autobúsqueda");
    expect(clientDashboardSource).toContain("driver_declined");
    expect(clientDashboardSource).toContain("UnPasajero.Com no recibe ni procesa el pago del viaje");
    expect(driverDashboardSource).toContain("DIRECT_PAYMENT_OPTIONS");
    expect(driverDashboardSource).toContain("Cobro directo al pasajero");
    expect(driverDashboardSource).toContain("unpasajero_driver_payment_methods");
    expect(trustBadgesSource).toContain("El conductor puede aceptar");
    expect(trustBadgesSource).toContain("Cash App");
  });

  it("no repite el precio cuando el pasajero está eligiendo conductor", () => {
    expect(tripRequestSource).toContain("RIDE SELECCIONADO");
    expect(tripRequestSource).not.toContain('text-xl text-emerald-200">${trip.estimatedPrice}');
    expect(tripRequestSource).toContain("Conductores disponibles cerca de ti");
  });

  it("centraliza la operación de viajes en el panel administrativo y aplica sus políticas", () => {
    expect(adminDashboardSource).toContain('"rideOperations"');
    expect(adminDashboardSource).toContain("RideOperationsAdminPanel");
    expect(adminDashboardSource).toContain("Selección manual obligatoria");
    expect(adminDashboardSource).toContain("Autobúsqueda disponible");
    expect(adminDashboardSource).toContain("driverResponseTimeoutSeconds");
    expect(adminDashboardSource).toContain("presenceMaxAgeSeconds");
    expect(siteConfigSource).toContain("directPaymentCashAppEnabled");
    expect(siteConfigSource).toContain("backgroundNotificationsEnabled");
    expect(clientDashboardSource).toContain("driverSearchRadiusMiles");
    expect(clientDashboardSource).toContain("autoSearchEnabled");
    expect(driverDashboardSource).toContain("allowedDirectPaymentOptions");
    expect(pushNotificationsSource).toContain("backgroundNotificationsAllowedByAdmin");
  });
});
