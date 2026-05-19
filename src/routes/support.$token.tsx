import { createFileRoute } from "@tanstack/react-router";
import { SupportChatPage } from "@/modules/crm/pages/support-chat-page";

export const Route = createFileRoute("/support/$token")({
  ssr: false,
  component: SupportChatRoute,
});

function SupportChatRoute() {
  const { token } = Route.useParams();
  return <SupportChatPage token={token} />;
}
