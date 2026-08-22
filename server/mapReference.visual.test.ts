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
    expect(mapSource).toContain("ROMA NORTE");
    expect(mapSource).toContain('color: "#48e894"');
    expect(mapSource).toContain('color: "#071912"');
  });

  it("incluye las tarjetas flotantes del viaje en curso", () => {
    expect(tripSource).toContain("passenger-map-route-card");
    expect(tripSource).toContain("passenger-map-pickup-card");
    expect(tripSource).toContain("passenger-map-destination-card");
    expect(tripSource).toContain("Seguimiento GPS en tiempo real");
    expect(tripSource).toContain("panTo(19.427, -99.1677)");
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
});
