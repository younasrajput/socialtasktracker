import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PackagesPage from "@/pages/Packages";
import AboutUs from "@/pages/AboutUs";
import Dashboard from "@/pages/Dashboard";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/packages" component={PackagesPage} />
      <Route path="/about" component={AboutUs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
