import { z } from "zod";

export const productFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional(),
    categoryId: z.string().optional(),
    brand: z.string().optional(),
    stock: z.coerce.number().min(0).optional(),
    warehouseId: z.string().optional(),
    purchasePrice: z.coerce.number().min(0).optional(),
    price: z.coerce.number().min(0).optional(),
    status: z.enum(["active", "inactive", "discontinued", "draft", "low-stock"]),
    barcode: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const stock = Number(data.stock ?? 0);
    if (stock > 0 && !data.warehouseId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a warehouse for opening stock",
        path: ["warehouseId"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const warehouseFormSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  is_default: z.boolean().optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export const stockAdjustmentSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  warehouseId: z.string().optional(),
  quantity: z.coerce.number().refine((n) => n !== 0, "Quantity cannot be zero"),
  unitCost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
