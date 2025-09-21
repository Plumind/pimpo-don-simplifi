import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Donations from "./pages/Donations";
import Services from "./pages/Services";
import Schooling from "./pages/Schooling";
import Energy from "./pages/Energy";
import NotFound from "./pages/NotFound";
import HouseholdPage from "./pages/Household";
import MobileNav from "./components/MobileNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Index />} />
            <Route path="/app/foyer" element={<HouseholdPage />} />
            <Route path="/app/donations" element={<Donations />} />
            <Route path="/app/services" element={<Services />} />
            <Route path="/app/energie" element={<Energy />} />
            <Route path="/app/scolarite" element={<Schooling />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
