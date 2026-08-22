import ForClientsSection from "@/components/ForClientsSection";
import Navbar from "@/components/Navbar";
import ForDriversSection from "@/components/ForDriversSection";
import ForFleetSection from "@/components/ForFleetSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import { ParcelPromoBar } from "@/components/ParcelPromoBar";
import SafetyCenterSection from "@/components/SafetyCenterSection";
import PlanComparatorSection from "@/components/PlanComparatorSection";
import UseCaseExplorer from "@/components/UseCaseExplorer";
import RideOverlayDemoPage from "@/pages/RideOverlayDemoPage";
import { useLocalAuth } from "@/contexts/LocalAuthContext";

export default function Home() {
  const { user, isAuthenticated, logout } = useLocalAuth();

  return (
    <div className="passenger-home min-h-screen">
      <Navbar
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        onLogin={() => (window.location.href = "/login")}
      />
      <RideOverlayDemoPage integrated />
      <ForClientsSection />
      <ForDriversSection />
      <SafetyCenterSection />
      <ForFleetSection />
      <PricingSection />
      <PlanComparatorSection />
      <UseCaseExplorer />
      <ParcelPromoBar />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
