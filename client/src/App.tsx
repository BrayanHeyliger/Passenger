import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { useLocalAuth } from "./contexts/LocalAuthContext";
import { lazy, Suspense, useEffect } from "react";

const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const DriverDashboard = lazy(() => import("./pages/DriverDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const FleetDashboard = lazy(() => import("./pages/FleetDashboard"));
const DispatcherDashboard = lazy(() => import("./pages/DispatcherDashboard"));
const Payments = lazy(() => import("./pages/Payments"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const PassengerMarketplacePage = lazy(() => import("./pages/PassengerMarketplacePage"));
const PassengerTripTrackingPage = lazy(() => import("./pages/PassengerTripTrackingPage"));
const ReferencePerfectTripTrackingPage = lazy(() => import("./pages/ReferencePerfectTripTrackingPage"));
const FunctionalReferenceTripTrackingPage = lazy(() => import("./pages/FunctionalReferenceTripTrackingPage"));
const TripFlowPreviewPage = lazy(() => import("./pages/TripFlowPreviewPage"));
const RideSelectionProposalPage = lazy(() => import("./pages/RideSelectionProposalPage"));
const LandingRideProposalPage = lazy(() => import("./pages/LandingRideProposalPage"));
const RideOverlayDemoPage = lazy(() => import("./pages/RideOverlayDemoPage"));
const TripRequestPage = lazy(() => import("./pages/TripRequestPage"));
const PassengerMobileDashboardPreview = lazy(() => import("./pages/PassengerMobileDashboardPreview"));

// Guard component: redirects to /login if not authenticated
function PrivateRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles?: string[];
}) {
  const { user, loading } = useLocalAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their correct panel
      const roleMap: Record<string, string> = {
        client: "/client-dashboard",
        driver: "/driver-dashboard",
        fleet: "/fleet-dashboard",
        admin: "/admin",
        dispatcher: "/dispatcher",
      };
      navigate(roleMap[user.role] || "/");
    }
  }, [user, loading, allowedRoles, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;
  return <Component />;
}

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#071217] text-[#63e9a7]">Cargando experiencia…</div>}>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/register"} component={Register} />
      <Route path={"/login"} component={Login} />
      <Route path={"/faq"} component={FAQPage} />
      <Route path={"/marketplace"} component={PassengerMarketplacePage} />
      <Route path={"/trip-flow-preview"} component={TripFlowPreviewPage} />
      <Route
        path={"/ride-selection-proposal"}
        component={RideSelectionProposalPage}
      />
      <Route
        path={"/landing-ride-proposal"}
        component={LandingRideProposalPage}
      />
      <Route path={"/ride-overlay-demo"} component={RideOverlayDemoPage} />
      <Route path={"/trip-request"} component={TripRequestPage} />
      <Route
        path={"/trip-tracking-static"}
        component={ReferencePerfectTripTrackingPage}
      />
      <Route
        path={"/trip-tracking"}
        component={PassengerTripTrackingPage}
      />
      <Route
        path={"/trip-tracking-functional"}
        component={FunctionalReferenceTripTrackingPage}
      />
      <Route
        path={"/trip-tracking-live"}
        component={PassengerTripTrackingPage}
      />
      <Route path={"/client-mobile"}>
        {() => <PassengerMobileDashboardPreview role="client" />}
      </Route>
      <Route path={"/driver-mobile"}>
        {() => <PassengerMobileDashboardPreview role="driver" />}
      </Route>
      <Route path={"/payments"} component={Payments} />
      <Route path={"/client-dashboard"}>
        {() => (
          <PrivateRoute component={ClientDashboard} allowedRoles={["client"]} />
        )}
      </Route>
      <Route path={"/driver-dashboard"}>
        {() => (
          <PrivateRoute component={DriverDashboard} allowedRoles={["driver"]} />
        )}
      </Route>
      <Route path={"/fleet-dashboard"}>
        {() => (
          <PrivateRoute component={FleetDashboard} allowedRoles={["fleet"]} />
        )}
      </Route>
      <Route path={"/admin"}>
        {() => (
          <PrivateRoute component={AdminDashboard} allowedRoles={["admin"]} />
        )}
      </Route>
      <Route path={"/dispatcher"}>
        {() => (
          <PrivateRoute
            component={DispatcherDashboard}
            allowedRoles={["dispatcher"]}
          />
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
