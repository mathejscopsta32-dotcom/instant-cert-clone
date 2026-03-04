import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Solicitar from "./pages/Solicitar";
import SolicitarConsulta from "./pages/SolicitarConsulta";
import MeuPedido from "./pages/MeuPedido";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import QuemSomos from "./pages/QuemSomos";
import Contato from "./pages/Contato";
import { useClickTracker } from "./hooks/useClickTracker";

const queryClient = new QueryClient();

const ClickTracker = () => {
  useClickTracker();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ClickTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/solicitar" element={<Solicitar />} />
          <Route path="/consulta" element={<SolicitarConsulta />} />
          <Route path="/meu-pedido" element={<MeuPedido />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
