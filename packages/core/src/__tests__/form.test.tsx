import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useFormContext } from "react-hook-form";
import { useActionForm } from "../use-action-form";
import { Form } from "../form";
import type { ServerAction } from "../types";

// ---------------------------------------------------------------------------
// <Form /> component tests
// ---------------------------------------------------------------------------

function TestFormContent() {
  const { register, formState } = useFormContext();
  return (
    <>
      <input data-testid="email" {...register("email")} />
      <button type="submit" data-testid="submit">
        {formState.isSubmitting ? "Loading..." : "Submit"}
      </button>
    </>
  );
}

describe("<Form />", () => {
  it("renders children inside a form element", () => {
    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    function Wrapper() {
      const form = useActionForm(action, {
        defaultValues: { email: "" },
      });
      return (
        <Form form={form} data-testid="form">
          <TestFormContent />
        </Form>
      );
    }

    render(<Wrapper />);
    expect(screen.getByTestId("form")).toBeInTheDocument();
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("submit")).toBeInTheDocument();
  });

  it("provides form context to children via useFormContext", () => {
    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    function ContextChecker() {
      const ctx = useFormContext();
      return <span data-testid="has-ctx">{ctx ? "yes" : "no"}</span>;
    }

    function Wrapper() {
      const form = useActionForm(action, {
        defaultValues: { email: "" },
      });
      return (
        <Form form={form}>
          <ContextChecker />
        </Form>
      );
    }

    render(<Wrapper />);
    expect(screen.getByTestId("has-ctx").textContent).toBe("yes");
  });

  it("submits to the server action on form submit", async () => {
    const user = userEvent.setup();
    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    function Wrapper() {
      const form = useActionForm(action, {
        defaultValues: { email: "test@test.com" },
      });
      return (
        <Form form={form}>
          <TestFormContent />
        </Form>
      );
    }

    render(<Wrapper />);

    await user.click(screen.getByTestId("submit"));

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
  });

  it("passes extra HTML attributes to the form element", () => {
    const action: ServerAction<{ success: true }> = vi.fn(async () => ({
      success: true as const,
    }));

    function Wrapper() {
      const form = useActionForm(action, { defaultValues: {} });
      return (
        <Form form={form} className="my-form" id="signup-form">
          <span>Content</span>
        </Form>
      );
    }

    render(<Wrapper />);
    const formEl = document.querySelector("#signup-form");
    expect(formEl).toBeInTheDocument();
    expect(formEl?.className).toBe("my-form");
  });
});
