import { BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";

type TrustBadgesProps = {
  variant?: "footer" | "checkout";
  showPayments?: boolean;
};

const assurances = [
  { label: "Pago Seguro", icon: ShieldCheck, tone: "emerald" },
  { label: "SSL Encriptado", icon: LockKeyhole, tone: "cyan" },
  { label: "Conductores Verificados", icon: BadgeCheck, tone: "violet" },
] as const;

const payments = ["VISA", "Mastercard", "AMEX", "Zelle", "PayPal"];

export function TrustBadges({ variant = "footer", showPayments = true }: TrustBadgesProps) {
  const compact = variant === "checkout";
  return (
    <section className={`saytaxi-trust-badges ${compact ? "saytaxi-trust-badges--checkout" : ""}`} aria-label="Seguridad y métodos de pago">
      <div className="saytaxi-trust-badges__assurances">
        {assurances.map(({ label, icon: Icon, tone }) => (
          <span className={`saytaxi-trust-badge saytaxi-trust-badge--${tone}`} key={label}>
            <Icon size={compact ? 13 : 15} strokeWidth={2.2} />
            {label}
          </span>
        ))}
      </div>
      {showPayments && (
        <div className="saytaxi-payment-methods" aria-label="Métodos de pago aceptados">
          <span className="saytaxi-payment-methods__label">Aceptamos</span>
          <div className="saytaxi-payment-methods__logos">
            {payments.map(method => <span key={method} className={`saytaxi-payment-logo saytaxi-payment-logo--${method.toLowerCase()}`}>{method}</span>)}
          </div>
        </div>
      )}
    </section>
  );
}
