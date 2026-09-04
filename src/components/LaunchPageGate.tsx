import { ReactNode } from "react";

interface LaunchPageGateProps {
  children: ReactNode;
}

export default function LaunchPageGate({ children }: LaunchPageGateProps) {
  return <>{children}</>;
}
