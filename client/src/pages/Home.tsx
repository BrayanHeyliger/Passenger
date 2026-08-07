/**
 * Home — WhatsApp Taxi SaaS Landing Page + Auth Integration
 * Design: Verde Operacional — Sora + Inter, dark/light alternating sections
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ModulesSection from "@/components/ModulesSection";
import TechStackSection from "@/components/TechStackSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar user={user} isAuthenticated={isAuthenticated} onLogout={logout} onLogin={startLogin} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ModulesSection />
      <TechStackSection />
      <PricingSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
