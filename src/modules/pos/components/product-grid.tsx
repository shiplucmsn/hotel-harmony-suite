import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMoney } from "@/modules/pos/utils";
import type { ProductDto } from "@/modules/inventory/types";

type ProductGridProps = {
  products: ProductDto[];
  categories: string[];
  category: string;
  onCategoryChange: (cat: string) => void;
  onSelect: (product: ProductDto) => void;
  loading?: boolean;
};

export function ProductGrid({
  products,
  categories,
  category,
  onCategoryChange,
  onSelect,
  loading,
}: ProductGridProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Tabs value={category} onValueChange={onCategoryChange}>
        <TabsList className="h-auto flex-wrap justify-start">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c} className="min-h-10 px-4 text-sm">
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="grid place-items-center py-16 text-muted-foreground">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="grid place-items-center py-16 text-muted-foreground">No products match</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => {
              const outOfStock = p.track_inventory !== false && p.stock <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => onSelect(p)}
                  className="touch-manipulation text-left active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-2 p-3">
                      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted/60 text-2xl font-semibold text-muted-foreground">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate text-sm font-medium leading-tight">{p.name}</div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-[10px] text-muted-foreground">{p.sku}</span>
                        <span className="shrink-0 text-sm font-bold text-primary">{formatMoney(p.price)}</span>
                      </div>
                      {outOfStock && (
                        <span className="text-[10px] font-medium text-destructive">Out of stock</span>
                      )}
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
