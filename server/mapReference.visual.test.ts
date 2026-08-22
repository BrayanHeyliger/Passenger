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
const tripActionDockSource = readFileSync(
  resolve(projectRoot, "client/src/components/TripActionDock.tsx"),
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
    expect(overlayDemoSource).toContain("La página se queda en su lugar");
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
    expect(tripRequestSource).toContain("Conductor asignado");
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
    expect(overlayDemoSource).toContain("Ubicación exacta activada");
  });

  it("reduce la repetición de contenido y concentra acciones de viaje en un menú inferior", () => {
    expect(clientDashboardSource).toContain("TripActionDock");
    expect(clientDashboardSource).toContain("Usa el menú inferior");
    expect(tripActionDockSource).toContain("Abrir chat");
    expect(tripActionDockSource).toContain("Enviar alerta SOS");
    expect(tripActionDockSource).toContain("Compartir viaje");
    expect(cssSource).toContain(".trip-action-dock-button");
  });
});
