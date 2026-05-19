import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getApiErrorMessage } from "@/lib/api-errors";
import { publicSupportApi } from "@/modules/crm/public-support-api";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type SupportChatPageProps = {
  token: string;
};

export function SupportChatPage({ token }: SupportChatPageProps) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["public-support", token],
    queryFn: () => publicSupportApi.ticket(token),
    refetchInterval: 15_000,
  });

  const sendMessage = useMutation({
    mutationFn: (body: string) => publicSupportApi.sendMessage(token, { body }),
    onSuccess: () => {
      setReply("");
      void qc.invalidateQueries({ queryKey: ["public-support", token] });
      toast.success("Message sent");
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Failed to send message")),
  });

  const messages = ticket?.messages ?? [];
  const isClosed = ticket?.status === "closed";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your conversation…</p>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <h1 className="text-lg font-semibold">Support link unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, "This link is invalid or has expired.")}
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/80 backdrop-blur px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{ticket.company_name} Support</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <h1 className="text-lg font-semibold">{ticket.subject}</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {ticket.number}
            </Badge>
            <Badge>{ticket.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            No login required — reply below and our team will respond by email or here.
          </p>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-3", m.from === "agent" && "flex-row-reverse")}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">{initials(m.author)}</AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[75%]", m.from === "agent" && "items-end flex flex-col")}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">{m.author}</span>
                  <span>{m.time}</span>
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    m.from === "agent"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm",
                  )}
                >
                  {m.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <footer className="border-t p-4 bg-card/50">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            placeholder={isClosed ? "This ticket is closed" : "Type your message…"}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={isClosed || sendMessage.isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (reply.trim()) sendMessage.mutate(reply.trim());
              }
            }}
          />
          <Button
            className="gradient-primary text-primary-foreground border-0 shrink-0"
            disabled={isClosed || !reply.trim() || sendMessage.isPending}
            onClick={() => sendMessage.mutate(reply.trim())}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
