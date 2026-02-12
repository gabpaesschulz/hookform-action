import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useActionForm } from "../use-action-form";
import type { JsonServerAction, FormDataServerAction } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

/** JSON action that succeeds – simulates updating a todo */
function createUpdateTodoAction(): JsonServerAction<{ success: true; data: TodoItem }> {
  return vi.fn(async (data: any) => ({
    success: true as const,
    data: { id: data.id ?? "todo-1", title: data.title, completed: data.completed ?? false },
  }));
}

/** JSON action that returns errors */
function createErrorTodoAction(): JsonServerAction<{ errors: { title: string[] } }> {
  return vi.fn(async (_data: any) => ({
    errors: { title: ["Title is required"] },
  }));
}

/** JSON action that throws */
function createThrowingTodoAction(): JsonServerAction<{ success: true }> {
  return vi.fn(async (_data: any) => {
    throw new Error("Network error");
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useActionForm – optimistic updates", () => {
  const INITIAL_TODO: TodoItem = {
    id: "todo-1",
    title: "Buy groceries",
    completed: false,
  };

  it("returns optimistic state when optimisticKey and optimisticData are provided", () => {
    const action = createUpdateTodoAction();

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { title: "Buy groceries", completed: false },
        optimisticKey: "todo-1",
        optimisticInitial: INITIAL_TODO,
        optimisticData: (current, formValues) => ({
          ...current,
          title: formValues.title,
          completed: formValues.completed,
        }),
      }),
    );

    expect(result.current.optimistic).toBeDefined();
    expect(result.current.optimistic!.data).toEqual(INITIAL_TODO);
    expect(result.current.optimistic!.isPending).toBe(false);
    expect(typeof result.current.optimistic!.rollback).toBe("function");
  });

  it("returns undefined optimistic when no optimisticKey is set", () => {
    const action = createUpdateTodoAction();

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { title: "" },
      }),
    );

    expect(result.current.optimistic).toBeUndefined();
  });

  it("updates optimistic data on successful submit", async () => {
    const action = createUpdateTodoAction();

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { title: "Updated title", completed: true },
        optimisticKey: "todo-1",
        optimisticInitial: INITIAL_TODO,
        optimisticData: (current, formValues) => ({
          ...current,
          title: formValues.title,
          completed: formValues.completed,
        }),
      }),
    );

    await act(async () => {
      const handler = result.current.handleSubmit();
      await handler();
    });

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true);
    });

    // After successful submit, the optimistic state should reflect the update
    expect(result.current.optimistic!.data.title).toBe("Updated title");
    expect(result.current.optimistic!.data.completed).toBe(true);
  });

  it("rolls back optimistic data on action error", async () => {
    const action = createErrorTodoAction();

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { title: "" },
        optimisticKey: "todo-1",
        optimisticInitial: INITIAL_TODO,
        optimisticData: (current, formValues) => ({
          ...current,
          title: formValues.title,
        }),
      }),
    );

    await act(async () => {
      const handler = result.current.handleSubmit();
      await handler();
    });

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(false);
    });

    // Should have rolled back to original
    expect(result.current.optimistic!.data.title).toBe("Buy groceries");
  });

  it("rolls back optimistic data on action throw", async () => {
    const action = createThrowingTodoAction();

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { title: "Will fail" },
        optimisticKey: "todo-1",
        optimisticInitial: INITIAL_TODO,
        optimisticData: (current, formValues) => ({
          ...current,
          title: formValues.title,
        }),
      }),
    );

    await act(async () => {
      const handler = result.current.handleSubmit();
      await handler();
    });

    await waitFor(() => {
      expect(result.current.formState.isSubmitting).toBe(false);
    });

    // Should have rolled back to original
    expect(result.current.optimistic!.data.title).toBe("Buy groceries");
  });

  it("manual rollback restores confirmed state", async () => {
    const action = createUpdateTodoAction();

    const { result } = renderHook(() =>
      useActionForm(action, {
        defaultValues: { title: "Updated title", completed: false },
        optimisticKey: "todo-1",
        optimisticInitial: INITIAL_TODO,
        optimisticData: (current, formValues) => ({
          ...current,
          title: formValues.title,
        }),
      }),
    );

    // Submit successfully to update confirmed state
    await act(async () => {
      const handler = result.current.handleSubmit();
      await handler();
    });

    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true);
    });

    // Now manually rollback
    act(() => {
      result.current.optimistic!.rollback();
    });

    // The confirmed state after success should be the updated value
    expect(result.current.optimistic!.data.title).toBe("Updated title");
  });
});
