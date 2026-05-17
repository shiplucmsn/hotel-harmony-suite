import { erpApi } from "@/lib/erp-api";

export const productsService = {
  list: () => erpApi.products.list(),
  create: (body: unknown) => erpApi.products.create(body),
  update: (id: string, body: unknown) => erpApi.products.update(id, body),
};
