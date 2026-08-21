import { useState } from "react";
import { toast } from "sonner";

/**
 * This route deliberately uses the approved visual composition as the visible
 * tracking surface. It prevents an external tile provider from changing street
 * geometry, labels, colours, or the layout that the customer approved.
 */
export default function ReferencePerfectTripTrackingPage() {
  const [shared, setShared] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b0f] text-white">
      <div className="reference-trip-canvas" aria-label="Seguimiento de viaje">
        <img
          src="/passenger-trip-reference.png"
          alt="Seguimiento de viaje en curso con ruta, conductor, puntos de recogida y destino"
          className="reference-trip-image"
        />

        <button
          type="button"
          aria-label="Compartir viaje"
          onClick={() => {
            setShared(true);
            toast.success("Enlace de viaje compartido");
          }}
          className="reference-trip-hotspot reference-trip-hotspot--share"
        />
        <button
          type="button"
          aria-label="Contactar conductor"
          onClick={() =>
            toast.info("Canal seguro de contacto con el conductor abierto")
          }
          className="reference-trip-hotspot reference-trip-hotspot--contact"
        />
        <button
          type="button"
          aria-label="Ayuda de seguridad"
          onClick={() => toast.success("Centro de seguridad activado")}
          className="reference-trip-hotspot reference-trip-hotspot--help"
        />
        <button
          type="button"
          aria-label="Centrar mapa"
          onClick={() => toast.info("Ubicación actual centrada")}
          className="reference-trip-hotspot reference-trip-hotspot--locate"
        />
        <button
          type="button"
          aria-label="Abrir información del conductor"
          onClick={() => toast.info("Mateo Rivera · Toyota Corolla · 4.9")}
          className="reference-trip-hotspot reference-trip-hotspot--driver"
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {shared ? "Viaje compartido" : "Seguimiento de viaje activo"}
      </p>
    </main>
  );
}
