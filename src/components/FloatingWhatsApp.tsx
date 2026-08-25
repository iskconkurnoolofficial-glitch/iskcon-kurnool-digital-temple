import { useAdmin } from "@/context/AdminContext";
import whatsappIcon from "@/assets/whatsapp.png";

export default function FloatingWhatsApp() {
  const { settings } = useAdmin();
  const rawNumber = (settings.whatsapp || "+919876543210").replace(/\D/g, "");
  const waUrl = settings.whatsapp?.startsWith("http") 
    ? settings.whatsapp 
    : `https://wa.me/${rawNumber}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 right-4 lg:right-6 z-40 h-13 w-13 sm:h-14 sm:w-14 rounded-full grid place-items-center shadow-elegant hover:scale-110 active:scale-95 transition-all"
    >
      <img src={whatsappIcon} alt="WhatsApp" className="h-full w-full rounded-full relative object-cover" />
    </a>
  );
}
