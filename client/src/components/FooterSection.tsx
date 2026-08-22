/**
 * FooterSection — WhatsApp Taxi SaaS
 * Design: Verde Operacional — dark footer con links y branding
 */
import { useI18n } from "@/contexts/I18nContext";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";
import { TrustBadges } from "@/components/TrustBadges";

const footerLinks = {
  Producto: ["Características", "Precios", "Changelog", "Roadmap"],
  Empresa: ["Sobre nosotros", "Blog", "Carreras", "Prensa"],
  Recursos: ["Documentación", "FAQ", "Guías", "Soporte"],
  Legal: ["Privacidad", "Términos de uso", "Cookies", "GDPR"],
};

export default function FooterSection() {
  const { t } = useI18n();

  return (
    <footer
      className="border-t"
      style={{
        background: "oklch(0.10 0.01 250)",
        borderColor: "oklch(1 0 0 / 0.08)",
      }}
    >
      <div className="container py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 font-black text-[#071016]">
                P
              </span>
              <span>
                <b className="block text-sm font-extrabold text-white">
                  UnPasajero.Com
                </b>
                <small className="block text-[9px] font-semibold tracking-[.16em] text-white/40">
                  ORLANDO MOBILITY
                </small>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Viajes, conductores y flotillas en una plataforma clara, segura y
              preparada para crecer.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ border: "1px solid oklch(1 0 0 / 0.1)" }}
                >
                  <Icon size={14} className="text-white/50" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-white font-semibold text-sm mb-4"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(link => (
                  <li key={link}>
                    <a
                      href={
                        link === "FAQ"
                          ? "#faq"
                          : link === "Características"
                            ? "#features"
                            : link === "Precios"
                              ? "#pricing"
                              : link === "Soporte"
                                ? "#contact"
                                : "#"
                      }
                      onClick={
                        link === "FAQ"
                          ? e => {
                              e.preventDefault();
                              document
                                .getElementById("faq")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }
                          : undefined
                      }
                      className="text-white/40 hover:text-white/80 text-sm transition-colors text-left cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <TrustBadges />

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
        >
          <p className="text-white/30 text-xs">
            © 2026 UnPasajero.Com. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-xs flex items-center gap-1.5">
            Hecho con <Heart size={11} className="text-red-400 fill-red-400" />{" "}
            para movilidad en Orlando, Florida
          </p>
        </div>
      </div>
    </footer>
  );
}
