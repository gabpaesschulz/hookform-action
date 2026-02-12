import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useActionForm } from "../use-action-form";
import { loadPersistedValues, savePersistedValues } from "../persist";
import type { ServerAction } from "../types";

// ---------------------------------------------------------------------------
// Persistence integration tests
// ---------------------------------------------------------------------------

describe("useActionForm – persistence", () => {
  const PERSIST_KEY = "wizard-step-1";

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("restores values from sessionStorage on mount", () => {
    // Pre-populate storage
    savePersistedValues(PERSIST_KEY, { email: "stored@test.com", name: "Bob" });

    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    const { result } = renderHook(() =>
      useActionForm(action, {
        persistKey: PERSIST_KEY,
        defaultValues: { email: "", name: "" },
      }),
    );

    expect(result.current.getValues("email")).toBe("stored@test.com");
    expect(result.current.getValues("name")).toBe("Bob");
  });

  it("persists form values to sessionStorage when fields change", async () => {
    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    const { result } = renderHook(() =>
      useActionForm(action, {
        persistKey: PERSIST_KEY,
        defaultValues: { email: "" },
        persistDebounce: 50, // shorter for tests
      }),
    );

    act(() => {
      result.current.setValue("email", "typing@test.com");
    });

    // Wait for debounce
    await new Promise((r) => setTimeout(r, 100));

    const stored = loadPersistedValues<{ email: string }>(PERSIST_KEY);
    expect(stored?.email).toBe("typing@test.com");
  });

  it("clears sessionStorage after successful submission", async () => {
    savePersistedValues(PERSIST_KEY, { email: "old@test.com" });

    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    const { result } = renderHook(() =>
      useActionForm(action, {
        persistKey: PERSIST_KEY,
        defaultValues: { email: "old@test.com" },
      }),
    );

    await act(async () => {
      const handler = result.current.handleSubmit();
      await handler();
    });

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true);
    });

    expect(loadPersistedValues(PERSIST_KEY)).toBeNull();
  });

  it("does NOT clear sessionStorage when submission has errors", async () => {
    savePersistedValues(PERSIST_KEY, { email: "bad@test.com" });

    const action: ServerAction<{ errors: { email: string[] } }> = vi.fn(async () => ({
      errors: { email: ["Invalid"] },
    }));

    const { result } = renderHook(() =>
      useActionForm(action, {
        persistKey: PERSIST_KEY,
        defaultValues: { email: "bad@test.com" },
      }),
    );

    await act(async () => {
      const handler = result.current.handleSubmit();
      await handler();
    });

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(false);
    });

    // Storage should still exist
    expect(loadPersistedValues(PERSIST_KEY)).not.toBeNull();
  });

  it("manually persists via persist()", () => {
    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    const { result } = renderHook(() =>
      useActionForm(action, {
        persistKey: PERSIST_KEY,
        defaultValues: { email: "" },
      }),
    );

    act(() => {
      result.current.setValue("email", "manual@test.com");
      result.current.persist();
    });

    const stored = loadPersistedValues<{ email: string }>(PERSIST_KEY);
    expect(stored?.email).toBe("manual@test.com");
  });

  it("clears persisted data via clearPersistedData()", () => {
    savePersistedValues(PERSIST_KEY, { email: "clear@test.com" });

    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    const { result } = renderHook(() =>
      useActionForm(action, {
        persistKey: PERSIST_KEY,
        defaultValues: { email: "" },
      }),
    );

    act(() => {
      result.current.clearPersistedData();
    });

    expect(loadPersistedValues(PERSIST_KEY)).toBeNull();
  });
});
