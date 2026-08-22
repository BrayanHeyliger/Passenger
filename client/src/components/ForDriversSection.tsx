import { RoleNarrativeCard } from "@/components/RoleNarrativeCard";

export default function ForDriversSection() {
  const register = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    sessionStorage.setItem("registerRole", "driver");
    window.location.href = "/register";
  };

  return (
    <section id="conductores" className="role-narrative-section role-narrative-section--driver">
      <div className="container">
        <div className="role-narrative-section__heading">
          <p>PARA CONDUCTORES</p>
          <h2>Más control. Menos vueltas.</h2>
          <span>Solicitudes, ruta y ganancias en una vista clara.</span>
        </div>
        <RoleNarrativeCard
          variant="driver"
          eyebrow="Tu operación, clara"
          title="Acepta. Navega. Gana."
          description="Las acciones clave siempre están a un toque."
          highlights={["Solicitudes vivas", "Ruta antes de aceptar", "Ganancias visibles"]}
          actionLabel="Ser conductor"
          actionHref="/register"
          onAction={register}
          statusLabel="Hoy"
          statusValue="$146"
          statusMeta="Ganancias estimadas"
        />
      </div>
    </section>
  );
}

