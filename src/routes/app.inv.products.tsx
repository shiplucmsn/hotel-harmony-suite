import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/inv/products")({
  beforeLoad: () => {
    throw redirect({ to: "/app/products" });
  },
});
