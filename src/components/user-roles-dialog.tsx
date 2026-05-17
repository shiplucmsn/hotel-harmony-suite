import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoles, useSyncUserRoles } from "@/hooks/rbac/use-roles";
import type { RbacUserDto } from "@/modules/rbac/types";

type UserRolesDialogProps = {
  user: RbacUserDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
  const { data: roles } = useRoles();
  const sync = useSyncUserRoles(user?.id ?? 0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user?.roles) return;
    setSelected(new Set(user.roles.map((r) => r.id)));
  }, [user?.id, user?.roles]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign roles</DialogTitle>
          <DialogDescription>
            Manage roles for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 space-y-2 overflow-y-auto py-2">
          {(roles ?? [])
            .filter((r) => r.slug !== "super-admin")
            .map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.has(role.id)}
                  onCheckedChange={(checked) => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(role.id);
                      else next.delete(role.id);
                      return next;
                    });
                  }}
                />
                <div>
                  <p className="text-sm font-medium">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{role.slug}</p>
                </div>
              </label>
            ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={sync.isPending}
            onClick={() =>
              sync.mutate([...selected], {
                onSuccess: () => onOpenChange(false),
              })
            }
          >
            {sync.isPending ? "Saving…" : "Save roles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
