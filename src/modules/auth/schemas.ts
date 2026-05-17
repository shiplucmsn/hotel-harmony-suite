import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  tenantSlug: z.string().optional(),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(120),
    email: z.string().email("Enter a valid work email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    passwordConfirmation: z.string(),
    tenantSlug: z.string().min(2, "Workspace ID is required").max(64),
    acceptTerms: z.boolean().refine((v) => v === true, { message: "You must accept the terms" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  tenantSlug: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    token: z.string().min(32, "Invalid reset token"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(32, "Invalid verification token"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
