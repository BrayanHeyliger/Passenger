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

describe("mapa dark premium de referencia", () => {
  it("mantiene el mapa urbano dark, la ruta y los marcadores funcionales", () => {
    expect(mapSource).toContain("basemaps.cartocdn.com/rastertiles/voyager");
    expect(mapSource).toContain("router.project-osrm.org/route/v1/driving");
    expect(mapSource).toContain("passenger-map-pin--pickup");
    expect(mapSource).toContain("passenger-map-pin--dropoff");
    expect(mapSource).toContain("passenger-map-vehicle");
    expect(mapSource).toContain("passenger-map-street-grid");
    expect(mapSource).toContain("ROMA NORTE");
    expect(mapSource).toContain('color: "#48e894"');
  });

  it("incluye las tarjetas flotantes del viaje en curso", () => {
    expect(tripSource).toContain("passenger-map-route-card");
    expect(tripSource).toContain("passenger-map-pickup-card");
    expect(tripSource).toContain("passenger-map-destination-card");
    expect(tripSource).toContain("Seguimiento GPS en tiempo real");
  });

  it("define tratamiento visual y responsive para el mapa", () => {
    expect(cssSource).toContain(".passenger-leaflet-map");
    expect(cssSource).toContain(".passenger-map-pin--dropoff");
    expect(cssSource).toContain("@media (max-width: 720px)");
  });
});
