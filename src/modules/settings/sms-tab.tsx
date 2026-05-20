import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-errors";
import { companyNotificationsApi } from "@/modules/settings/company-notifications-api";

export function SmsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [accountSid, setAccountSid] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [testTo, setTestTo] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sms = await companyNotificationsApi.sms();
        if (!active) return;
        if (sms) {
          setAccountSid(sms.account_sid ?? "");
          setFromNumber(sms.from_number ?? "");
          setHasToken(Boolean(sms.has_auth_token));
        }
      } catch {
        // first-time
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS gateway (Twilio)</CardTitle>
        <CardDescription>Send SMS alerts to users with a phone number on their profile.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 max-w-3xl">
        <div className="space-y-1.5 md:col-span-2">
          <Label>Account SID</Label>
          <Input value={accountSid} onChange={(e) => setAccountSid(e.target.value)} placeholder="ACxxxxxxxx" disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label>From number</Label>
          <Input value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} placeholder="+1234567890" disabled={loading} />
        </div>
        <div className="space-y-1.5">
          <Label>Auth token</Label>
          <Input
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder={hasToken ? "•••••••• (leave blank to keep)" : "Twilio auth token"}
            disabled={loading}
          />
        </div>
        <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Credential status</p>
            <p className="text-xs text-muted-foreground">Encrypted and stored per company</p>
          </div>
          <Badge variant={hasToken && accountSid ? "default" : "secondary"} className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            {hasToken && accountSid ? "Configured" : "Not configured"}
          </Badge>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Test phone (E.164)</Label>
          <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="+8801..." disabled={loading} />
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button
            variant="outline"
            disabled={loading || testing}
            onClick={async () => {
              setTesting(true);
              try {
                await companyNotificationsApi.testSms(testTo || undefined);
                toast.success("Test SMS sent");
              } catch (e) {
                toast.error(getApiErrorMessage(e, "Failed to send test SMS"));
              } finally {
                setTesting(false);
              }
            }}
          >
            {testing ? "Sending…" : "Send test"}
          </Button>
          <Button
            className="gradient-primary border-0 text-primary-foreground"
            disabled={loading || saving}
            onClick={async () => {
              setSaving(true);
              try {
                const sms = await companyNotificationsApi.saveSms({
                  account_sid: accountSid,
                  from_number: fromNumber,
                  auth_token: authToken || null,
                });
                if (authToken) setAuthToken("");
                setHasToken(Boolean(sms?.has_auth_token));
                toast.success("SMS settings saved");
              } catch (e) {
                toast.error(getApiErrorMessage(e, "Failed to save SMS settings"));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
