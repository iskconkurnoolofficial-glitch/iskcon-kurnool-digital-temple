import { createFileRoute } from "@tanstack/react-router";
import Page from "./donate";

export const Route = createFileRoute("/donate/$slug")({
  component: SevaCheckoutRoute,
});

function SevaCheckoutRoute() {
  const { slug } = Route.useParams();
  return <Page initialSlug={slug} />;
}
