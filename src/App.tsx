import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InvoiceStoreProvider } from "./context/InvoiceStore";
import { ClearingStoreProvider } from "./store/ClearingStore";
import ShellLayout from "./components/ShellLayout";
import HomePage from "./pages/HomePage";
import InvoicesScreen from "./pages/InvoicesScreen";
import ConsentPage from "./pages/ConsentPage";
import HistoryPage from "./pages/HistoryPage";
import HelpPage from "./pages/HelpPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import EmailPage from "./pages/EmailPage";
import PrototypeControls from "./components/PrototypeControls";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InvoiceStoreProvider>
        <ClearingStoreProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ShellLayout>
                  <HomePage />
                </ShellLayout>
              } />
              <Route path="/clearing" element={
                <ShellLayout>
                  <InvoicesScreen />
                </ShellLayout>
              } />
              <Route path="/consent" element={<ConsentPage />} />
              <Route path="/history" element={
                <ShellLayout>
                  <HistoryPage />
                </ShellLayout>
              } />
              <Route path="/help" element={
                <ShellLayout>
                  <HelpPage />
                </ShellLayout>
              } />
              <Route path="/email" element={<EmailPage />} />
              <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <PrototypeControls />
          </BrowserRouter>
        </ClearingStoreProvider>
      </InvoiceStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
