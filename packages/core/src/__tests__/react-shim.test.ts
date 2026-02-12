import { describe, it, expect, vi } from "vitest";
import * as shim from "../react-shim";

// ---------------------------------------------------------------------------
// React shim tests
// ---------------------------------------------------------------------------

describe("react-shim", () => {
  it("exports useTransition as a function", () => {
    expect(typeof shim.useTransition).toBe("function");
  });

  it("exports hasUseOptimistic as a boolean", () => {
    expect(typeof shim.hasUseOptimistic).toBe("boolean");
  });

  it("exports hasUseActionState as a boolean", () => {
    expect(typeof shim.hasUseActionState).toBe("boolean");
  });

  it("useOptimistic is undefined or function depending on React version", () => {
    // In React 18 test env, useOptimistic won't exist
    if (shim.hasUseOptimistic) {
      expect(typeof shim.useOptimistic).toBe("function");
    } else {
      expect(shim.useOptimistic).toBeUndefined();
    }
  });

  it("useActionState is undefined or function depending on React version", () => {
    // In React 18 test env, useActionState won't exist
    if (shim.hasUseActionState) {
      expect(typeof shim.useActionState).toBe("function");
    } else {
      expect(shim.useActionState).toBeUndefined();
    }
  });
});
