import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { categories } from "@/lib/inventory-mock";
import { Plus, FolderTree, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/inv/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Categories & Subcategories" description="Organize your catalog hierarchy." breadcrumbs={[{ label: "Inventory" }, { label: "Categories" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-2" />New category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create category</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input placeholder="e.g. Outdoor Gear" /></div>
                <div><Label>Parent (optional)</Label><Input placeholder="None" /></div>
                <div><Label>Description</Label><Input placeholder="Short description" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); toast.success("Category created"); }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(c => (
          <Card key={c.id} className="hover:shadow-elegant transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><FolderTree className="h-5 w-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.count} products</p>
                  </div>
                </div>
                <Badge variant="outline">{c.subs.length} subs</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {c.subs.map(s => (
                <div key={s} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                  <span className="flex items-center gap-2 text-muted-foreground"><ChevronRight className="h-3 w-3" />{s}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
