import { RoleNarrativeCard } from "@/components/RoleNarrativeCard";

export default function ForDriversSection() {
  const register = (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); sessionStorage.setItem("registerRole", "driver"); window.location.href = "/register"; };
  return <section id="conductores" className="role-narrative-section role-narrative-section--driver"><div className="container"><div className="role-narrative-section__heading"><p>PARA CONDUCTORES</p><h2>Más control de tu día,<br />con viajes claros.</h2><span>Recibe solicitudes, revisa rutas y mantén tus ganancias visibles desde una sola experiencia.</span></div><RoleNarrativeCard variant="driver" eyebrow="Para conductores" title="Más control de tu día, con viajes claros y soporte cerca." description="Recibe solicitudes, revisa tu ruta y mantén tus ganancias visibles desde una experiencia directa." highlights={["Solicitudes en tiempo real", "Ruta clara antes de aceptar", "Ganancias visibles"]} actionLabel="Conocer experiencia" actionHref="/register" onAction={register} statusLabel="Hoy" statusValue="$146" statusMeta="Ganancias estimadas · Ejemplo visual" /></div></section>;
}
