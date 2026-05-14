import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Download, Trash2, FolderOpen } from "lucide-react";
import { documents } from "@/lib/hr-mock";

export const Route = createFileRoute("/app/hr/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee documents"
        description="Upload, verify and manage employee files."
        breadcrumbs={[{ label: "HR" }, { label: "Documents" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gradient-primary text-primary-foreground border-0"><Upload className="mr-2 h-4 w-4" />Upload document</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2"><Label>Employee *</Label><Input placeholder="Search employee…" /></div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["Contract","ID","Education","Legal","Tax","Other"].map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, JPG · max 10 MB</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                <Button className="gradient-primary text-primary-foreground border-0" onClick={()=>setOpen(false)}>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Document</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map(d => (
              <TableRow key={d.id}>
                <TableCell><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><span className="font-medium">{d.name}</span></div></TableCell>
                <TableCell className="text-muted-foreground">{d.employee}</TableCell>
                <TableCell><Badge variant="outline">{d.category}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.size}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.uploaded}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={d.status === "verified" ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}>{d.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
