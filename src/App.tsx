import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InvoiceStoreProvider } from "./context/InvoiceStore";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import EmailPage from "./pages/EmailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InvoiceStoreProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/received" element={<Index />} />
            <Route path="/sent" element={<Index />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </InvoiceStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
