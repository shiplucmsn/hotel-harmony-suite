import { z } from "zod";

export const accountFormSchema = z.object({
  code: z.string().min(2, "Code is required").max(40),
  name: z.string().min(2, "Name is required").max(120),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  description: z.string().max(500).optional(),
  is_postable: z.boolean().default(true),
});

export const journalLineSchema = z.object({
  account_code: z.string().min(1, "Account required"),
  debit: z.coerce.number().min(0),
  credit: z.coerce.number().min(0),
});

export const journalFormSchema = z
  .object({
    entry_date: z.string().min(1, "Date is required"),
    reference_type: z.string().min(1).max(80),
    reference_id: z.string().min(1).max(80),
    memo: z.string().min(1, "Memo is required").max(500),
    lines: z.array(journalLineSchema).min(2, "At least two lines required"),
  })
  .superRefine((data, ctx) => {
    const debit = data.lines.reduce((s, l) => s + l.debit, 0);
    const credit = data.lines.reduce((s, l) => s + l.credit, 0);
    if (Math.round(debit * 100) !== Math.round(credit * 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total debits must equal total credits",
        path: ["lines"],
      });
    }
  });

export type AccountFormValues = z.infer<typeof accountFormSchema>;
export type JournalFormValues = z.infer<typeof journalFormSchema>;
