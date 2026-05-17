import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderTree, ChevronRight, Search, Loader2 } from "lucide-react";
import { CategoryCreateDialog } from "@/modules/inventory/components/category-create-dialog";
import { useInventoryCategories } from "@/hooks/inventory/use-inventory-categories";
import { inventoryApi } from "@/modules/inventory/inventory-api";
import { buildCategoryTree, countProductsByCategory } from "@/modules/inventory/utils";
import { getApiErrorMessage } from "@/lib/api-errors";

export const Route = createFileRoute("/app/inv/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);

  const { data: categories = [], isLoading, isError, error, refetch } = useInventoryCategories();

  const { data: products = [] } = useQuery({
    queryKey: ["inventory", "products", "category-counts"],
    queryFn: async () => {
      const { data } = await inventoryApi.products({ per_page: 500 });
      return data;
    },
  });

  const productCounts = useMemo(() => countProductsByCategory(products), [products]);

  const tree = useMemo(() => buildCategoryTree(categories, productCounts), [categories, productCounts]);

  const filteredTree = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tree;
    return tree.filter((root) => {
      const rootMatch =
        root.name.toLowerCase().includes(q) || root.code.toLowerCase().includes(q);
      const childMatch = root.children.some(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
      return rootMatch || childMatch;
    });
  }, [tree, search]);

  const rootCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories & Subcategories"
        description="Organize your catalog hierarchy from the inventory master."
        breadcrumbs={[{ label: "Inventory" }, { label: "Categories" }]}
        actions={
          <Button
            size="sm"
            className="gradient-primary border-0 text-primary-foreground"
            onClick={() => {
              setDefaultParentId(null);
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New category
          </Button>
        }
      />

      <Card className="p-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading categories…
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{getApiErrorMessage(error, "Failed to load categories")}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Retry
          </Button>
        </Card>
      ) : filteredTree.length === 0 ? (
        <Card className="p-10 text-center">
          <FolderTree className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No categories yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first category to organize products.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create category
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTree.map((root) => (
            <Card key={root.id} className="transition-all hover:shadow-elegant">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FolderTree className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{root.name}</CardTitle>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{root.code}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {root.productCount} product{root.productCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={root.is_active ? "outline" : "secondary"}>
                      {root.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{root.children.length} subs</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {root.description ? (
                  <p className="mb-2 text-xs text-muted-foreground">{root.description}</p>
                ) : null}
                {root.children.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">No subcategories</p>
                ) : (
                  root.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <ChevronRight className="h-3 w-3" />
                        {child.name}
                        <span className="font-mono text-[10px]">({child.code})</span>
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {productCounts[child.id] ?? 0} items
                      </span>
                    </div>
                  ))
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 w-full text-xs"
                  onClick={() => {
                    setDefaultParentId(root.id);
                    setCreateOpen(true);
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add subcategory
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentOptions={rootCategories}
        defaultParentId={defaultParentId}
        onCreated={() => setDefaultParentId(null)}
      />
    </div>
  );
}
