"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type DefaultValues, type FieldPath, type FieldValues, useForm } from "react-hook-form";
import type { ZodError, ZodSchema } from "zod";

import type {
  ActionFormState,
  ActionResult,
  ErrorMapper,
  FieldErrorRecord,
  OptimisticState,
  SubmissionRecord,
  SubmitFunction,
  UseActionFormCoreOptions,
  UseActionFormCoreReturn,
} from "./core-types";
import { defaultErrorMapper } from "./core-types";
import { clearPersistedValues, debounce, loadPersistedValues, savePersistedValues } from "./persist";
import { hasUseOptimistic, useOptimistic as useOptimisticReact19, useTransition } from "./react-shim";

// ---------------------------------------------------------------------------
// Internal: client-side Zod validation helper
// ---------------------------------------------------------------------------

function validateWithSchema(schema: ZodSchema, values: Record<string, unknown>): FieldErrorRecord | null {
  const result = schema.safeParse(values);
  if (result.success) return null;

  const zodError = result.error as ZodError;
  const flat = zodError.flatten();
  const errors: FieldErrorRecord = {};

  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    if (messages && messages.length > 0) {
      errors[field] = messages as string[];
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// ---------------------------------------------------------------------------
// Internal: noop optimistic fallback for React 18
// ---------------------------------------------------------------------------

function useOptimisticFallback<T>(initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initial);
  return [state, setState];
}

// ---------------------------------------------------------------------------
// useActionFormCore – framework-agnostic core hook (v3)
// ---------------------------------------------------------------------------

/**
 * Core hook that powers both the Next.js adapter and the standalone adapter.
 * It handles:
 * - React Hook Form integration
 * - Client-side Zod validation
 * - Optimistic UI (React 19 useOptimistic with React 18 fallback)
 * - Session persistence
 * - Plugin lifecycle
 *
 * **This hook knows nothing about Next.js, Server Actions, or FormData.**
 * Adapters are responsible for wrapping their submit mechanisms into
 * a simple `(data: TFieldValues) => Promise<TResult>` function.
 *
 * @param submit - A generic async function that receives validated data and returns a result.
 * @param options - Configuration options.
 */
export function useActionFormCore<
  TFieldValues extends FieldValues = FieldValues,
  TResult = ActionResult,
  TOptimistic = undefined,
>(
  submit: SubmitFunction<TFieldValues, TResult>,
  options: UseActionFormCoreOptions<TFieldValues, TResult, TOptimistic> = {},
): UseActionFormCoreReturn<TFieldValues, TResult, TOptimistic> {
  const {
    defaultValues: optionDefaults,
    mode = "onSubmit",
    persistKey,
    errorMapper = defaultErrorMapper as ErrorMapper<TResult>,
    onSuccess,
    onError,
    persistDebounce = 300,
    schema: optionsSchema,
    validationMode = "onSubmit",
    optimisticKey,
    optimisticData,
    optimisticInitial,
    plugins = [],
  } = options;

  // ----- Resolve Zod schema -----------------------------------------------

  const resolvedSchema = useMemo(() => optionsSchema ?? undefined, [optionsSchema]);

  // ----- Resolve initial values (persisted > options) ----------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  const resolvedDefaults = useMemo<DefaultValues<TFieldValues> | undefined>(() => {
    if (persistKey) {
      const persisted = loadPersistedValues<TFieldValues>(persistKey);
      if (persisted) {
        return {
          ...(optionDefaults as Record<string, unknown> | undefined),
          ...persisted,
        } as DefaultValues<TFieldValues>;
      }
    }
    return optionDefaults;
  }, []);

  // ----- React Hook Form ---------------------------------------------------

  const form = useForm<TFieldValues>({
    defaultValues: resolvedDefaults,
    mode,
  });

  // ----- useTransition (React 18 & 19) ------------------------------------

  const [isTransitioning, startTransition] = useTransition();

  // ----- Action state ------------------------------------------------------

  const [actionState, setActionState] = useState<ActionFormState<TResult>>({
    isSubmitting: false,
    isSubmitSuccessful: false,
    submitErrors: null,
    actionResult: null,
    isPending: false,
  });

  // ----- Submission history (for DevTools) ----------------------------------

  const submissionHistoryRef = useRef<SubmissionRecord<TResult>[]>([]);

  // ----- Optimistic UI (React 19 only) -------------------------------------

  const hasOptimistic = optimisticKey != null && optimisticData != null;

  const useOptimisticHook = hasUseOptimistic && useOptimisticReact19 ? useOptimisticReact19 : useOptimisticFallback;

  const [optimisticState, setOptimistic] = useOptimisticHook(optimisticInitial as TOptimistic);

  const confirmedOptimisticRef = useRef<TOptimistic>(optimisticInitial as TOptimistic);

  const rollbackOptimistic = useCallback(() => {
    setOptimistic(confirmedOptimisticRef.current);
  }, [setOptimistic]);

  // ----- Persistence -------------------------------------------------------

  const debouncedSave = useMemo(() => {
    if (!persistKey) return null;
    return debounce((values: TFieldValues) => {
      savePersistedValues(persistKey, values);
    }, persistDebounce);
  }, [persistKey, persistDebounce]);

  useEffect(() => {
    if (!persistKey || !debouncedSave) return;

    const subscription = form.watch((values) => {
      debouncedSave(values as TFieldValues);
    });

    return () => subscription.unsubscribe();
  }, [persistKey, debouncedSave, form]);

  // ----- Client-side Zod validation (onChange / onBlur) ---------------------

  useEffect(() => {
    if (!resolvedSchema || validationMode === "onSubmit") return;

    const subscription = form.watch((values, { name, type }) => {
      if (!name) return;

      if (validationMode === "onChange" || type === "blur") {
        const fieldResult = resolvedSchema.safeParse(values);
        if (fieldResult.success) {
          form.clearErrors(name as FieldPath<TFieldValues>);
        } else {
          const zodError = fieldResult.error as ZodError;
          const flat = zodError.flatten();
          const fieldErrors = flat.fieldErrors[name];

          if (fieldErrors && fieldErrors.length > 0) {
            form.setError(name as FieldPath<TFieldValues>, {
              type: "validation",
              message: fieldErrors[0],
            });
          } else {
            form.clearErrors(name as FieldPath<TFieldValues>);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [resolvedSchema, validationMode, form]);

  // ----- Plugin lifecycle: onMount -----------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: plugins identity changes every render; run once on mount
  useEffect(() => {
    const cleanups = plugins.map((p) => p.onMount?.()).filter(Boolean) as (() => void)[];

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  // ----- Manual persist / clear --------------------------------------------

  const persist = useCallback(() => {
    if (!persistKey) return;
    savePersistedValues(persistKey, form.getValues());
  }, [persistKey, form]);

  const clearPersisted = useCallback(() => {
    if (!persistKey) return;
    clearPersistedValues(persistKey);
  }, [persistKey]);

  // ----- Set a server error on a field -------------------------------------

  const setSubmitError = useCallback(
    (field: keyof TFieldValues & string, message: string) => {
      form.setError(field as never, { type: "server", message });
    },
    [form],
  );

  // ----- Map server errors to RHF ------------------------------------------

  const applyServerErrors = useCallback(
    (errors: FieldErrorRecord) => {
      for (const [field, messages] of Object.entries(errors)) {
        if (messages && messages.length > 0) {
          form.setError(field as never, {
            type: "server",
            message: messages[0],
          });
        }
      }
    },
    [form],
  );

  // ----- Core submit logic -------------------------------------------------

  const executeSubmit = useCallback(
    async (data: TFieldValues) => {
      // Client-side schema validation (for onSubmit mode)
      if (resolvedSchema && validationMode === "onSubmit") {
        const clientErrors = validateWithSchema(resolvedSchema, data as Record<string, unknown>);
        if (clientErrors) {
          applyServerErrors(clientErrors);
          setActionState({
            isSubmitting: false,
            isSubmitSuccessful: false,
            submitErrors: clientErrors,
            actionResult: null,
            isPending: false,
          });
          return;
        }
      }

      // Plugin: onBeforeSubmit
      for (const plugin of plugins) {
        if (plugin.onBeforeSubmit) {
          const shouldContinue = await plugin.onBeforeSubmit(data);
          if (shouldContinue === false) return;
        }
      }

      setActionState((prev) => ({
        ...prev,
        isSubmitting: true,
        isPending: true,
        submitErrors: null,
      }));

      // Apply optimistic update before the action runs
      if (hasOptimistic && optimisticData) {
        const optimisticResult = optimisticData(confirmedOptimisticRef.current, data);
        setOptimistic(optimisticResult);
      }

      const startTime = Date.now();

      try {
        const result = await submit(data);

        const fieldErrors = errorMapper(result);

        // Record submission for DevTools
        const record: SubmissionRecord<TResult> = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: Date.now(),
          payload: data as Record<string, unknown>,
          response: result,
          error: null,
          duration: Date.now() - startTime,
          success: !fieldErrors || Object.keys(fieldErrors).length === 0,
        };
        submissionHistoryRef.current = [...submissionHistoryRef.current.slice(-49), record];

        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
          applyServerErrors(fieldErrors);

          if (hasOptimistic) {
            rollbackOptimistic();
          }

          setActionState({
            isSubmitting: false,
            isSubmitSuccessful: false,
            submitErrors: fieldErrors,
            actionResult: result,
            isPending: false,
          });

          // Plugin: onError
          for (const plugin of plugins) {
            plugin.onError?.(result, data);
          }

          onError?.(result);
        } else {
          // Success – update confirmed optimistic state
          if (hasOptimistic && optimisticData) {
            confirmedOptimisticRef.current = optimisticData(confirmedOptimisticRef.current, data);
          }

          // Clear persisted data
          if (persistKey) clearPersistedValues(persistKey);

          setActionState({
            isSubmitting: false,
            isSubmitSuccessful: true,
            submitErrors: null,
            actionResult: result,
            isPending: false,
          });

          // Plugin: onSuccess
          for (const plugin of plugins) {
            plugin.onSuccess?.(result, data);
          }

          onSuccess?.(result);
        }
      } catch (error) {
        // Record failed submission for DevTools
        const record: SubmissionRecord<TResult> = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: Date.now(),
          payload: data as Record<string, unknown>,
          response: null,
          error: error instanceof Error ? error : new Error(String(error)),
          duration: Date.now() - startTime,
          success: false,
        };
        submissionHistoryRef.current = [...submissionHistoryRef.current.slice(-49), record];

        if (hasOptimistic) {
          rollbackOptimistic();
        }

        setActionState((prev) => ({
          ...prev,
          isSubmitting: false,
          isSubmitSuccessful: false,
          isPending: false,
        }));

        const wrappedError = error instanceof Error ? error : new Error(String(error));

        // Plugin: onError
        for (const plugin of plugins) {
          plugin.onError?.(wrappedError as TResult & Error, data);
        }

        onError?.(wrappedError);
      }
    },
    [
      submit,
      errorMapper,
      applyServerErrors,
      onSuccess,
      onError,
      persistKey,
      resolvedSchema,
      validationMode,
      hasOptimistic,
      optimisticData,
      setOptimistic,
      rollbackOptimistic,
      plugins,
    ],
  );

  // ----- handleSubmit wrapper ----------------------------------------------

  const handleSubmit = useCallback(
    (onValid?: (data: TFieldValues) => void | Promise<void>) => {
      return form.handleSubmit(async (data) => {
        if (onValid) await onValid(data);

        // @ts-ignore – React 19 supports async transitions; React 18 ignores the promise
        startTransition(async () => {
          await executeSubmit(data);
        });
      });
    },
    [form, executeSubmit, startTransition],
  );

  // ----- Compose return value ----------------------------------------------

  const composedFormState = useMemo(
    () => ({
      ...form.formState,
      // Explicitly read proxy-tracked properties from RHF's formState
      // so they survive the spread (RHF uses a Proxy internally).
      errors: form.formState.errors,
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid,
      touchedFields: form.formState.touchedFields,
      dirtyFields: form.formState.dirtyFields,
      isLoading: form.formState.isLoading,
      isValidating: form.formState.isValidating,
      ...actionState,
      isSubmitting: form.formState.isSubmitting || actionState.isSubmitting,
      isPending: isTransitioning || actionState.isPending,
    }),
    [form.formState, actionState, isTransitioning],
  );

  // ----- Compose optimistic return -----------------------------------------

  const optimisticReturn = useMemo(() => {
    if (!hasOptimistic) return undefined;
    return {
      data: optimisticState,
      isPending: isTransitioning || actionState.isPending,
      rollback: rollbackOptimistic,
    } as OptimisticState<TOptimistic>;
  }, [hasOptimistic, optimisticState, isTransitioning, actionState.isPending, rollbackOptimistic]);

  // ----- Compose control with DevTools metadata ----------------------------

  const enhancedControl = useMemo(() => {
    const ctrl = form.control as typeof form.control & {
      _submissionHistory: SubmissionRecord<TResult>[];
      _actionFormState: ActionFormState<TResult>;
    };
    ctrl._submissionHistory = submissionHistoryRef.current;
    ctrl._actionFormState = actionState;
    return ctrl;
  }, [form.control, actionState]);

  return {
    ...form,
    control: enhancedControl,
    handleSubmit,
    formState: composedFormState,
    setSubmitError,
    persist,
    clearPersistedData: clearPersisted,
    optimistic: optimisticReturn,
  } as UseActionFormCoreReturn<TFieldValues, TResult, TOptimistic>;
}
