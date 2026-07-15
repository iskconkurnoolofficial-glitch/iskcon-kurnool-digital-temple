import { createFileRoute } from "@tanstack/react-router";
import Page from "./donate";

export const Route = createFileRoute("/donate/")({
  component: DonateIndexRoute,
});

function DonateIndexRoute() {
  return <Page />;
}
