import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CalendarDays, MoreHorizontal } from "lucide-react";
import { holidays } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/holidays")({ component: HolidaysPage });

function HolidaysPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday calendar"
        description="Public holidays, optional & regional days off."
        breadcrumbs={[{ label: "HR" }, { label: "Holidays" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Plus className="mr-2 h-4 w-4" />Add holiday</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add holiday</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2"><Label>Name *</Label><Input placeholder="e.g. Thanksgiving" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Date *</Label><Input type="date" /></div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select defaultValue="Public"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Public">Public</SelectItem><SelectItem value="Optional">Optional</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2"><Label>Region</Label><Input placeholder="e.g. US, EU, All" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={()=>setOpen(false)}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {holidays.map(h => (
          <Card key={h.id} className="overflow-hidden">
            <div className="gradient-primary p-3 text-center text-primary-foreground">
              <p className="text-xs uppercase tracking-wide opacity-90">{new Date(h.date).toLocaleString("default",{month:"short"})}</p>
              <p className="text-2xl font-bold">{new Date(h.date).getDate()}</p>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm">{h.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{h.type}</Badge>
                <span className="text-xs text-muted-foreground">{h.region}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>All holidays · 2026</CardTitle></CardHeader>
        <Table>
          <TableHeader><TableRow className="bg-muted/40"><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Day</TableHead><TableHead>Type</TableHead><TableHead>Region</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {holidays.map(h => (
              <TableRow key={h.id}>
                <TableCell className="font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" />{h.name}</TableCell>
                <TableCell>{h.date}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(h.date).toLocaleString("default",{weekday:"long"})}</TableCell>
                <TableCell><Badge variant="outline">{h.type}</Badge></TableCell>
                <TableCell>{h.region}</TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
