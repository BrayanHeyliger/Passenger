/**
 * Home — WhatsApp Taxi SaaS Landing Page + Auth Integration
 * Design: Verde Operacional — Sora + Inter, dark/light alternating sections
 */
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ModulesSection from "@/components/ModulesSection";
import TechStackSection from "@/components/TechStackSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  const { user, isAuthenticated, logout } = useLocalAuth();

  return (
    <div className="min-h-screen">
      <Navbar user={user} isAuthenticated={isAuthenticated} onLogout={logout} onLogin={() => window.location.href = "/login"} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ModulesSection />
      <TechStackSection />
      <PricingSection />
      <ContactSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
