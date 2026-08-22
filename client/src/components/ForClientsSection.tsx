import { RoleNarrativeCard } from "@/components/RoleNarrativeCard";

export default function ForClientsSection() {
  return (
    <section id="clientes" className="role-narrative-section role-narrative-section--passenger">
      <div className="container">
        <div className="role-narrative-section__heading">
          <p>PARA PASAJEROS</p>
          <h2>Viaja sin fricción.</h2>
          <span>Precio, conductor y ruta en un mismo vistazo.</span>
        </div>
        <RoleNarrativeCard
          variant="passenger"
          eyebrow="Listo para moverte"
          title="Todo claro antes de subir."
          description="Confirma y sigue tu viaje sin cambiar de pantalla."
          highlights={["Precio claro", "Conductor verificado", "Ruta en vivo"]}
          actionLabel="Ver seguimiento"
          actionHref="/trip-tracking"
          statusLabel="Llega en 3 min"
          statusValue="Daniel M."
          statusMeta="Nissan Versa · 4.9 ★"
        />
      </div>
    </section>
  );
}
