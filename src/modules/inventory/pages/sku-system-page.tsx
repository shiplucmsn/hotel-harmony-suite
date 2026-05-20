import { useMemo, useState } from "react";
import { Copy, Hash, Loader2, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateSku, useSkuRegistry } from "@/hooks/inventory/use-skus";
import { useDeferredValue } from "react";

export function SkuSystemPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [categoryPrefix, setCategoryPrefix] = useState("ELEC");
  const [subPrefix, setSubPrefix] = useState("LP");
  const [generated, setGenerated] = useState("");

  const { data, isLoading, isError } = useSkuRegistry({
    search: deferredSearch || undefined,
    per_page: 100,
  });
  const generateSku = useGenerateSku();

  const rows = data?.data ?? [];

  const previewSku = useMemo(() => {
    const base = [categoryPrefix.trim(), subPrefix.trim()].filter(Boolean).join("-");
    return base ? `${base}-001` : "—";
  }, [categoryPrefix, subPrefix]);

  const handleGenerate = async () => {
    const result = await generateSku.mutateAsync({
      category_prefix: categoryPrefix.trim(),
      subcategory_prefix: subPrefix.trim() || undefined,
    });
    setGenerated(result.sku);
    toast.success(`Generated ${result.sku}`);
  };

  const copySku = (sku: string) => {
    void navigator.clipboard.writeText(sku);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="SKU System"
        description="Central SKU registry — all modules reference products in the database."
        breadcrumbs={[{ label: "Inventory" }, { label: "SKU" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            SKU generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label className="text-xs text-muted-foreground">Category prefix</Label>
              <Input value={categoryPrefix} onChange={(e) => setCategoryPrefix(e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Subcategory</Label>
              <Input value={subPrefix} onChange={(e) => setSubPrefix(e.target.value.toUpperCase())} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Preview pattern</Label>
              <Input value={previewSku} readOnly className="font-mono bg-muted/40" />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => void handleGenerate()}
                disabled={generateSku.isPending || !categoryPrefix.trim()}
              >
                {generateSku.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate next SKU"}
              </Button>
            </div>
          </div>
          {generated && (
            <div className="mt-4 rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
              <code className="font-mono text-lg">{generated}</code>
              <Button variant="ghost" size="sm" onClick={() => copySku(generated)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            SKU registry
            <Badge variant="secondary" className="font-normal">
              {data?.pagination?.total ?? rows.length} SKUs
            </Badge>
          </CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search SKU, name, barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <p className="p-6 text-sm text-destructive">Failed to load SKU registry. Check API connection.</p>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No SKUs yet. Create products in Inventory → Products.</p>
          )}
          {!isLoading && !isError && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.category ?? "—"}</TableCell>
                    <TableCell>{row.warehouse ?? "—"}</TableCell>
                    <TableCell className="text-right">{row.stock}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copySku(row.sku)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
