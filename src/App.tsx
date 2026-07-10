import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "@/pages/admin/Login";
import SubAdminLogin from "@/pages/subadmin/Login";
import { AdminRoutes } from "@/routes/AdminRoutes";
import { SubAdminRoutes } from "@/routes/SubadminRoutes";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Logins */}
            <Route path="/" element={<AdminLogin />} />
            <Route path="/subadmin-login" element={<SubAdminLogin />} />

            {/* Subadmin Role Routes (/subadmin/*) */}
            <Route path="/subadmin/*" element={<SubAdminRoutes />} />

            {/* Admin Role Routes (/*) */}
            <Route path="/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
