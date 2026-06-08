import whatsappIcon from "@/assets/whatsapp.png";

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/919505377520"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 h-14 w-14 rounded-full grid place-items-center shadow-elegant hover:scale-110 transition"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <img src={whatsappIcon} alt="WhatsApp" className="h-14 w-14 rounded-full relative object-cover" />
    </a>
  );
}
