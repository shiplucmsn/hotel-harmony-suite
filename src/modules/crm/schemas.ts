import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const customerFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const orderLineSchema = z.object({
  sku: z.string().min(1, "SKU required"),
  quantity: z.coerce.number().positive("Qty must be > 0"),
  unit_price: z.coerce.number().min(0),
  unit_cost: z.coerce.number().min(0).optional(),
});

export const orderFormSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  tax_amount: z.coerce.number().min(0).default(0),
  lines: z.array(orderLineSchema).min(1, "Add at least one line"),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const invoiceFormSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  crm_order_id: z.string().optional(),
  tax_amount: z.coerce.number().min(0).default(0),
  due: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const paymentFormSchema = z.object({
  invoice_id: z.string().min(1, "Invoice is required"),
  amount: z.coerce.number().positive("Amount must be > 0"),
  payment_date: z.string().optional(),
  method: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
