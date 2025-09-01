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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/foyer" element={<HouseholdPage />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/services" element={<Services />} />
          <Route path="/energie" element={<Energy />} />
          <Route path="/scolarite" element={<Schooling />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
