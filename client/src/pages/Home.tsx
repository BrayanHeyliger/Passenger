import { useLocalAuth } from "@/contexts/LocalAuthContext";
import ForClientsSection from "@/components/ForClientsSection";
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

export default function Home() {
  return (
    <div className="passenger-home min-h-screen">
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
