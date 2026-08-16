import { Monitor } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface InstallAppButtonProps {
  variant?: "footer" | "banner";
  className?: string;
}

export default function InstallAppButton({ variant = "footer", className = "" }: InstallAppButtonProps) {
  const { isInstalled, promptInstall } = usePwaInstall();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    promptInstall();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      title="Directly install ISKCON Kurnool on your desktop via Chrome"
      className={`group flex items-center gap-2 text-footer-foreground/80 hover:text-secondary transition-all duration-300 text-sm text-left cursor-pointer ${className}`}
    >
      <Monitor className="h-3.5 w-3.5 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
      <span>{isInstalled ? "Launch / Installed App" : "Install Desktop App (Chrome)"}</span>
    </button>
  );
}
