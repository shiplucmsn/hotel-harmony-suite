import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues } from "react-hook-form";
import type { ZodType } from "zod";

export function createZodResolver<T extends FieldValues>(schema: ZodType<T>) {
  return zodResolver(schema);
}
