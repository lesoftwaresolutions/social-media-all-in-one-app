import React from 'react';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import ContentStudio from "@/pages/content-studio";
import AIGenerator from "@/pages/ai-generator";
import Scheduler from "@/pages/scheduler";
import CalendarView from "@/pages/calendar";
import SocialAccounts from "@/pages/social-accounts";
import MediaLibrary from "@/pages/media";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/content-studio" component={ContentStudio} />
              <Route path="/ai-generator" component={AIGenerator} />
              <Route path="/scheduler" component={Scheduler} />
              <Route path="/calendar" component={CalendarView} />
              <Route path="/social-accounts" component={SocialAccounts} />
              <Route path="/media" component={MediaLibrary} />
              <Route path="/settings" component={Settings} />
              <Route path="/billing" component={Billing} />
              <Route path="/" component={Dashboard} /> {/* default protected route */}
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Catch-all for sub-routes that don't match exactly */}
      <Route path="/:rest*">
        <ProtectedRoute>
          <AppLayout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/content-studio" component={ContentStudio} />
              <Route path="/ai-generator" component={AIGenerator} />
              <Route path="/scheduler" component={Scheduler} />
              <Route path="/calendar" component={CalendarView} />
              <Route path="/social-accounts" component={SocialAccounts} />
              <Route path="/media" component={MediaLibrary} />
              <Route path="/settings" component={Settings} />
              <Route path="/billing" component={Billing} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
