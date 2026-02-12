"use server";

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function loginAction(
  prevState: { errors?: Record<string, string[]>; success?: boolean } | null,
  formData: FormData,
) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1000));

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Simulate auth check
  if (parsed.data.email === "taken@example.com") {
    return { errors: { email: ["This email is already registered"] } };
  }

  return { success: true };
}
