import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type AppPreloaderProps = {
  message?: string;
  className?: string;
};

export function AppPreloader({ message = "Loading workspace…", className }: AppPreloaderProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center bg-background",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="relative flex flex-col items-center gap-5 px-6 text-center animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <Sparkles className="h-7 w-7 animate-pulse text-primary-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">Nebula ERP</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
