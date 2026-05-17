import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePreloaderController } from "@/hooks/use-preloader-controller";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppErrorBoundary } from "@/shared/components/feedback/app-error-boundary";

type AppProvidersProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

function PreloaderController() {
  usePreloaderController();
  return null;
}

export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={150}>
          <AppErrorBoundary>
            <PreloaderController />
            {children}
            <Toaster richColors closeButton position="top-right" />
          </AppErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
