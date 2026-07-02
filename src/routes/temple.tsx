import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/temple")({
  component: () => <Outlet />,
});
