
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirebaseAuthProvider } from "@/contexts/firebase-auth-context";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Landing from "@/pages/landing";
import FirebaseLogin from "@/pages/firebase-login";
import FirebaseRegister from "@/pages/firebase-register";
import BarberDashboard from "@/pages/barber-dashboard";
import Booking from "@/pages/booking";
import ClientBooking from "@/pages/client-booking";
import Subscribe from "@/pages/subscribe";
import SubscriptionPage from "@/pages/subscription";
import PaymentPayPal from "@/pages/payment-paypal";
import PaymentSuccess from "@/pages/payment-success";
import TrialExpired from "@/pages/trial-expired";
import NotFound from "@/pages/not-found";
import Legal from "@/pages/legal";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Cookies from "@/pages/cookies";
import LegalNotice from "@/pages/legal-notice";
import FirebaseSetup from "@/pages/firebase-setup";
import FirebaseTest from "@/pages/firebase-test";
import { FirebaseSetupInstructions } from "./pages/firebase-setup-instructions";
import DirectLogin from "./pages/direct-login";
import DirectDashboard from "./pages/direct-dashboard";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/login" component={FirebaseLogin} />
            <Route path="/register" component={FirebaseRegister} />
            <Route path="/dashboard" component={BarberDashboard} />
            <Route path="/book/:barberId" component={Booking} />
            <Route path="/client-booking/:barberId" component={ClientBooking} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/subscription" component={SubscriptionPage} />
            <Route path="/payment" component={PaymentPayPal} />
            <Route path="/payment-success" component={PaymentSuccess} />
            <Route path="/trial-expired" component={TrialExpired} />
            <Route path="/legal" component={Legal} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/cookies" component={Cookies} />
            <Route path="/legal-notice" component={LegalNotice} />
            <Route path="/firebase-setup" component={FirebaseSetup} />
            <Route path="/firebase-setup-instructions" component={FirebaseSetupInstructions} />
            <Route path="/firebase-test" component={FirebaseTest} />
            <Route path="/direct-login" component={DirectLogin} />
            <Route path="/direct-dashboard" component={DirectDashboard} />

            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
