import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { isApexHostname } from "@/lib/tenant-resolve";

export const Route = createFileRoute("/workspace-not-found")({
  ssr: false,
  component: WorkspaceNotFoundPage,
});

function WorkspaceNotFoundPage() {
  const apex = isApexHostname();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Building2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This URL does not match an active company workspace. Check the subdomain with your administrator or create a
          new workspace from our main site.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {apex ? (
            <>
              <Button asChild className="gradient-primary border-0 text-primary-foreground">
                <Link to="/signup">Create workspace</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Go home</Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <a href={`${window.location.protocol}//${getApexHost()}/signup`}>Create a workspace</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getApexHost(): string {
  const base = import.meta.env.VITE_TENANT_BASE_DOMAIN ?? "localhost";
  const port = window.location.port ? `:${window.location.port}` : "";
  return `${base}${port}`;
}
