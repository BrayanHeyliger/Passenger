/**
 * Navbar — WhatsApp Taxi SaaS
 * Design: Verde Operacional — Sora display, Inter body
 * Transparent on top, transitions to dark on scroll
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Características", href: "#features" },
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Módulos", href: "#modules" },
  { label: "Precios", href: "#pricing" },
  { label: "Contacto", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.13_0.01_250/0.97)] backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-green-500/20">
              <img
                src="/manus-storage/logo-icon_34950e08.png"
                alt="WhatsApp Taxi Logo"
                className="w-full h-full object-cover"
                style={{ background: "oklch(0.76 0.18 148)" }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-white font-bold text-base tracking-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                WhatsApp<span className="text-[oklch(0.76_0.18_148)]">Taxi</span>
              </span>
              <span className="text-white/50 text-[10px] font-medium tracking-widest uppercase">
                SaaS Platform
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 hover:text-[oklch(0.76_0.18_148)]"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 text-sm"
            >
              Iniciar sesión
            </Button>
            <Button
              className="text-sm font-semibold px-5 shadow-lg shadow-green-500/25 active:scale-[0.97] transition-transform"
              style={{
                background: "oklch(0.76 0.18 148)",
                color: "oklch(0.08 0.02 148)",
              }}
              onClick={() => handleNavClick("#pricing")}
            >
              Empezar gratis
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[oklch(0.13_0.01_250/0.98)] backdrop-blur-xl border-t border-white/10">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-white/80 hover:text-white text-left py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
              <Button variant="ghost" className="text-white/80 hover:text-white w-full justify-center">
                Iniciar sesión
              </Button>
              <Button
                className="w-full font-semibold"
                style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}
                onClick={() => handleNavClick("#pricing")}
              >
                Empezar gratis
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
