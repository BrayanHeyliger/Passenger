import { RoleNarrativeCard } from "@/components/RoleNarrativeCard";

export default function ForClientsSection() {
  return <section id="clientes" className="role-narrative-section role-narrative-section--passenger"><div className="container"><div className="role-narrative-section__heading"><p>PARA PASAJEROS</p><h2>Tu viaje, más claro<br />desde el primer toque.</h2><span>Una experiencia directa: cotización, conductor validado y seguimiento visible sin pantallas de más.</span></div><RoleNarrativeCard variant="passenger" eyebrow="Para pasajeros" title="Un viaje que se siente simple desde el primer toque." description="Precio estimado, conductor validado y seguimiento en vivo sin tener que buscar entre pantallas." highlights={["Precio antes de confirmar", "Conductor verificado", "Ruta en tiempo real"]} actionLabel="Conocer experiencia" actionHref="/trip-tracking" statusLabel="Tu conductor llega en 3 min" statusValue="Daniel M." statusMeta="Nissan Versa · 4.9 ★" /></div></section>;
}
