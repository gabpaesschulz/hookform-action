import { describe, it, expect } from "vitest";
import { z } from "zod";
import { withZod } from "../with-zod";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("withZod", () => {
  const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  // ---- Successful validation -----------------------------------------------

  it("calls the handler with parsed data when validation passes", async () => {
    const handler = vi.fn(async (data: { email: string; password: string }) => ({
      success: true as const,
      data,
    }));

    const action = withZod(schema, handler);

    const result = await action({ email: "test@example.com", password: "12345678" });

    expect(handler).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "12345678",
    });
    expect(result).toEqual({
      success: true,
      data: { email: "test@example.com", password: "12345678" },
    });
  });

  // ---- Failed validation ---------------------------------------------------

  it("returns field errors in flatten format when validation fails", async () => {
    const handler = vi.fn(async () => ({ success: true as const }));

    const action = withZod(schema, handler);

    const result = await action({ email: "bad", password: "short" });

    expect(handler).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      errors: {
        email: ["Invalid email"],
        password: ["Password must be at least 8 characters"],
      },
    });
  });

  // ---- Missing fields ------------------------------------------------------

  it("returns errors for missing required fields", async () => {
    const handler = vi.fn(async () => ({ success: true as const }));

    const action = withZod(schema, handler);

    const result = await action({});

    expect(handler).not.toHaveBeenCalled();
    expect(result).toHaveProperty("success", false);
    expect(result).toHaveProperty("errors");

    const errors = (result as any).errors;
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  // ---- FormData input ------------------------------------------------------

  it("converts FormData to a plain object before validating", async () => {
    const handler = vi.fn(async (data: { email: string; password: string }) => ({
      success: true as const,
      data,
    }));

    const action = withZod(schema, handler);

    const fd = new FormData();
    fd.append("email", "form@test.com");
    fd.append("password", "securepass");

    const result = await action(fd);

    expect(handler).toHaveBeenCalledWith({
      email: "form@test.com",
      password: "securepass",
    });
    expect(result).toEqual({
      success: true,
      data: { email: "form@test.com", password: "securepass" },
    });
  });

  // ---- FormData with invalid data ------------------------------------------

  it("returns errors when FormData contains invalid data", async () => {
    const handler = vi.fn(async () => ({ success: true as const }));

    const action = withZod(schema, handler);

    const fd = new FormData();
    fd.append("email", "not-an-email");
    fd.append("password", "123");

    const result = await action(fd);

    expect(handler).not.toHaveBeenCalled();
    expect(result).toHaveProperty("success", false);

    const errors = (result as any).errors;
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});
