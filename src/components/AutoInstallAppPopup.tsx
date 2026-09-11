import React from "react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import InstallAppModal from "./InstallAppModal";

export default function AutoInstallAppPopup() {
  const { isInstalled, hasNativePrompt, promptInstall, isModalOpen, closeModal, deviceInfo } = usePwaInstall({
    autoPromptNewUser: true,
  });

  if (isInstalled || !isModalOpen) return null;

  return (
    <InstallAppModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onInstall={promptInstall}
      hasNativePrompt={hasNativePrompt}
      isInstalled={isInstalled}
      deviceInfo={deviceInfo}
    />
  );
}
