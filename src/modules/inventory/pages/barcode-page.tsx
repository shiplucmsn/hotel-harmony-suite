import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarcodeStrip } from "@/modules/inventory/components/barcode-strip";
import { ProductStatusBadge } from "@/modules/inventory/components/product-status-badge";
import { useInventoryProducts } from "@/hooks/inventory/use-inventory-products";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import { formatMoney, productDisplayStatus } from "@/modules/inventory/utils";
import type { ProductDto } from "@/modules/inventory/types";
import { ScanBarcode, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-errors";

type BarcodePageProps = {
  initialQuery?: string;
};

export function BarcodePage({ initialQuery = "" }: BarcodePageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [lookupResult, setLookupResult] = useState<ProductDto | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: productsResult } = useInventoryProducts({ per_page: 48 });
  const products = (productsResult?.data ?? []).filter((p) => p.barcode || p.sku);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) void runLookup(initialQuery);
  }, [initialQuery]);

  const runLookup = async (value?: string) => {
    const code = (value ?? query).trim();
    if (!code) return;
    setLookupLoading(true);
    try {
      const product = await inventoryApi.lookupBarcode(code);
      setLookupResult(product);
    } catch (e) {
      setLookupResult(null);
      toast.error(getApiErrorMessage(e, "No product found for this barcode"));
    } finally {
      setLookupLoading(false);
    }
  };

  const onScanKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void runLookup();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barcode manager"
        description="Scan, lookup and print product barcodes."
        breadcrumbs={[{ label: "Inventory" }, { label: "Barcodes" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              inputRef.current?.focus();
              inputRef.current?.select();
            }}
          >
            <ScanBarcode className="mr-2 h-4 w-4" />
            Focus scanner
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan or enter barcode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onScanKey}
                placeholder="Scan barcode or type SKU…"
                className="pl-9 font-mono"
                autoComplete="off"
              />
            </div>
            <Button
              className="gradient-primary border-0 text-primary-foreground"
              disabled={lookupLoading}
              onClick={() => void runLookup()}
            >
              Lookup
            </Button>
          </div>

          {lookupResult ? (
            <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-lg font-semibold">{lookupResult.name}</p>
                <p className="font-mono text-sm text-muted-foreground">{lookupResult.sku}</p>
                <ProductStatusBadge
                  status={productDisplayStatus(lookupResult.stock, String(lookupResult.status))}
                />
                <p className="text-sm">
                  Stock: <span className="font-semibold">{lookupResult.stock}</span> · Price:{" "}
                  {formatMoney(Number(lookupResult.price))}
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/app/products/$productId" params={{ productId: String(lookupResult.id) }}>
                    <Eye className="mr-2 h-4 w-4" />
                    View product
                  </Link>
                </Button>
              </div>
              <BarcodeStrip value={lookupResult.barcode ?? lookupResult.sku} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="space-y-3 p-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">{p.sku}</p>
                <p className="truncate text-sm font-medium">{p.name}</p>
              </div>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  setQuery(p.barcode ?? p.sku);
                  void runLookup(p.barcode ?? p.sku);
                }}
              >
                <BarcodeStrip value={p.barcode ?? p.sku} height={56} />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
