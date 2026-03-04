import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5511968586856";
const WHATSAPP_MESSAGE = "Olá, preciso de ajuda com meu pedido";

const FloatingWhatsApp = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco no WhatsApp"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);

export default FloatingWhatsApp;
