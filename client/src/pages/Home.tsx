/**
 * Home — WhatsApp Taxi SaaS Landing Page
 * Design: Verde Operacional — Sora + Inter, dark/light alternating sections
 */
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
  return (
    <div className="min-h-screen">
      <Navbar />
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
