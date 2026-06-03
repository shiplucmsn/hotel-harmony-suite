import { useEffect, useState, type ReactNode } from "react";
import { isAuthenticated } from "@/lib/auth-session";
import { setTenantId } from "@/lib/api-auth";
import { useTenantContext } from "@/hooks/use-tenant-context";
import { tenantApi, type TenantBrandingDto } from "@/modules/platform/tenant-api";

function applyBranding(branding: TenantBrandingDto | undefined) {
  if (!branding) return;

  if (branding.app_name) {
    document.title = branding.app_name;
  }

  if (branding.primary_color) {
    document.documentElement.style.setProperty("--primary", branding.primary_color);
  }

  if (branding.favicon_url) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.favicon_url;
  }
}

/** Applies tenant branding from API (public host resolve or authenticated context). */
export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const { data } = useTenantContext();
  const [publicBranding, setPublicBranding] = useState<TenantBrandingDto | undefined>();

  useEffect(() => {
    if (isAuthenticated()) return;

    const host = window.location.hostname;
    if (!host || host === "localhost") return;

    tenantApi
      .resolvePublic(host)
      .then((res) => {
        if (res.data?.branding) setPublicBranding(res.data.branding);
        if (res.data?.tenant_id) {
          setTenantId(res.data.tenant_id);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    applyBranding(data?.branding ?? publicBranding);
  }, [data?.branding, publicBranding]);

  return <>{children}</>;
}
