 import { useLocalAuth } from "@/contexts/LocalAuthContext";
 import Navbar from "@/components/Navbar";
 import HeroSection from "@/components/HeroSection";
 import ForClientsSection from "@/components/ForClientsSection";
 import ForDriversSection from "@/components/ForDriversSection";
 import ForFleetSection from "@/components/ForFleetSection";
 import PricingSection from "@/components/PricingSection";
 import ContactSection from "@/components/ContactSection";
 import FooterSection from "@/components/FooterSection";
 import TestimonialsSection from "@/components/TestimonialsSection";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { ParcelPromoBar } from "@/components/ParcelPromoBar";

export default function Home() {
  const { user, isAuthenticated, logout } = useLocalAuth();

  return (
    <div className="min-h-screen">
      <Navbar user={user} isAuthenticated={isAuthenticated} onLogout={logout} onLogin={() => window.location.href = "/login"} />
      <HeroSection />
      <ForClientsSection />
      <ForDriversSection />
      <ForFleetSection />
      <PricingSection />
      <TestimonialsSection />
      <ParcelPromoBar />
      <ContactSection />
      <FooterSection />
      <PWAInstallBanner />
      <WhatsAppFloatingButton />
    </div>
  );
}
