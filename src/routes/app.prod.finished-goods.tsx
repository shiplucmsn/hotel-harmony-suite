import { createFileRoute } from "@tanstack/react-router";
import { FinishedGoodsPage } from "@/modules/production/pages/finished-goods-page";

export const Route = createFileRoute("/app/prod/finished-goods")({
  component: FinishedGoodsPage,
});
