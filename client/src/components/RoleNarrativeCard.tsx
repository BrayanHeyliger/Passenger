import { ArrowRight, CheckCircle2, MapPinned, Route, ShieldCheck, WalletCards } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./RoleNarrativeCard.css";

type RoleNarrativeCardProps = {
  variant: "passenger" | "driver";
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  actionLabel: string;
  actionHref: string;
  onAction?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  statusLabel: string;
  statusValue: string;
  statusMeta: string;
};

export function RoleNarrativeCard({
  variant,
  eyebrow,
  title,
  description,
  highlights,
  actionLabel,
  actionHref,
  onAction,
  statusLabel,
  statusValue,
  statusMeta,
}: RoleNarrativeCardProps) {
  const passenger = variant === "passenger";
  const cardRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.16 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article ref={cardRef} className={`role-narrative-card role-narrative-card--${variant} ${isVisible ? "is-visible" : ""}`}>
      <div className="role-narrative-card__copy">
        <p className="role-narrative-card__eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p className="role-narrative-card__description">{description}</p>
        <div className="role-narrative-card__highlights" aria-label={eyebrow}>
          {highlights.map((highlight, index) => {
            const Icon = passenger ? [WalletCards, ShieldCheck, MapPinned][index] || CheckCircle2 : [Route, WalletCards, CheckCircle2][index] || CheckCircle2;
            return <span key={highlight}><Icon size={14} />{highlight}</span>;
          })}
        </div>
        <a href={actionHref} onClick={onAction} className="role-narrative-card__action">
          {actionLabel} <ArrowRight size={17} />
        </a>
      </div>

      {passenger ? (
        <div className="role-narrative-card__visual role-narrative-card__visual--passenger" aria-label="Resumen visual de un viaje">
          <div className="mini-trip-card">
            <div className="mini-trip-card__status"><i />{statusLabel}</div>
            <div className="mini-trip-card__route"><span /><b /><em /></div>
            <strong>{statusValue}</strong>
            <small>{statusMeta}</small>
          </div>
        </div>
      ) : (
        <div className="role-narrative-card__visual role-narrative-card__visual--driver" aria-label="Resumen visual de ganancias de conductor">
          <div className="mini-earnings-card">
            <span>{statusLabel}</span>
            <strong>{statusValue}</strong>
            <small>{statusMeta}</small>
            <div className="mini-earnings-card__bars" aria-hidden="true">
              {[30, 52, 39, 69, 55, 82, 100].map(height => <i key={height} style={{ height: `${height}%` }} />)}
            </div>
            <p>6 viajes completados <b>↗</b></p>
          </div>
        </div>
      )}
    </article>
  );
}
