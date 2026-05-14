import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { User } from "@/lib/mock-data";

export function UserFormDialog({
  open, onOpenChange, user,
}: { open: boolean; onOpenChange: (v: boolean) => void; user?: User }) {
  const isEdit = !!user;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Invite new user"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update user details and access." : "Send an invitation email and assign a role."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
            toast.success(isEdit ? "User updated" : "Invitation sent");
          }}
          className="grid gap-4"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" defaultValue={user?.name.split(" ")[0]} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" defaultValue={user?.name.split(" ")[1]} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" defaultValue={user?.email} required />
            <p className="text-xs text-muted-foreground">An invitation will be sent to this address.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select defaultValue={user?.role ?? "Viewer"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Admin", "Manager", "Sales", "Accountant", "Viewer"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select defaultValue={user?.department ?? "Sales"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Sales", "Operations", "Finance", "Marketing", "Procurement"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Send welcome email</p>
              <p className="text-xs text-muted-foreground">Notify the user when their account is ready.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save changes" : "Send invitation"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
