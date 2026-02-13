'use client'

import type { ActionFormState, SubmissionRecord } from 'hookform-action-core'
import { type CSSProperties, useCallback, useEffect, useState } from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { useFormState, useWatch } from 'react-hook-form'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormDevToolProps<TFieldValues extends FieldValues = FieldValues> {
  /**
   * The `control` object from `useActionForm` (any adapter) or `useActionFormCore`.
   * Must be the enhanced control that includes `_submissionHistory` and `_actionFormState`.
   */
  control: Control<TFieldValues> & {
    _submissionHistory?: SubmissionRecord<unknown>[]
    _actionFormState?: ActionFormState<unknown>
  }

  /**
   * Position of the floating panel toggle button.
   * @default 'bottom-right'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

  /**
   * Initial open state.
   * @default false
   */
  defaultOpen?: boolean
}

// ---------------------------------------------------------------------------
// Styles (inline to avoid CSS dependencies)
// ---------------------------------------------------------------------------

const COLORS = {
  bg: '#1a1a2e',
  bgLight: '#16213e',
  bgPanel: '#0f3460',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  accent: '#e94560',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#334155',
  badge: '#7c3aed',
}

function getToggleStyles(position: string): CSSProperties {
  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: COLORS.accent,
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }

  switch (position) {
    case 'bottom-left':
      return { ...base, bottom: 16, left: 16 }
    case 'top-left':
      return { ...base, top: 16, left: 16 }
    case 'top-right':
      return { ...base, top: 16, right: 16 }
    default:
      return { ...base, bottom: 16, right: 16 }
  }
}

function getPanelStyles(position: string): CSSProperties {
  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 99998,
    width: 420,
    maxHeight: '70vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 13,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  switch (position) {
    case 'bottom-left':
      return { ...base, bottom: 72, left: 16 }
    case 'top-left':
      return { ...base, top: 72, left: 16 }
    case 'top-right':
      return { ...base, top: 72, right: 16 }
    default:
      return { ...base, bottom: 72, right: 16 }
  }
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: COLORS.bgPanel,
  borderBottom: `1px solid ${COLORS.border}`,
  fontWeight: 700,
  fontSize: 14,
}

const tabBarStyle: CSSProperties = {
  display: 'flex',
  borderBottom: `1px solid ${COLORS.border}`,
}

const tabStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  padding: '8px 12px',
  border: 'none',
  backgroundColor: active ? COLORS.bgLight : 'transparent',
  color: active ? COLORS.text : COLORS.textMuted,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: active ? 600 : 400,
  borderBottom: active ? `2px solid ${COLORS.accent}` : '2px solid transparent',
  fontFamily: 'inherit',
})

const contentStyle: CSSProperties = {
  overflow: 'auto',
  padding: 16,
  maxHeight: 'calc(70vh - 100px)',
}

const sectionTitle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  color: COLORS.textMuted,
  marginBottom: 8,
  letterSpacing: '0.05em',
}

const kvRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 0',
  borderBottom: `1px solid ${COLORS.border}`,
}

const keyStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: 12,
}

const valueStyle: CSSProperties = {
  color: COLORS.text,
  fontSize: 12,
  fontWeight: 500,
  maxWidth: 200,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const badgeStyle = (color: string): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 9999,
  fontSize: 11,
  fontWeight: 600,
  backgroundColor: color,
  color: '#fff',
})

const historyItemStyle = (success: boolean): CSSProperties => ({
  padding: '8px 12px',
  marginBottom: 8,
  borderRadius: 8,
  backgroundColor: COLORS.bgLight,
  borderLeft: `3px solid ${success ? COLORS.success : COLORS.error}`,
})

const actionBtnStyle: CSSProperties = {
  padding: '6px 12px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  backgroundColor: 'transparent',
  color: COLORS.text,
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'inherit',
  marginRight: 8,
  transition: 'background-color 0.2s',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Tab = 'state' | 'history' | 'actions'

/**
 * `<FormDevTool />` – Floating debug panel for hookform-action.
 *
 * Shows real-time form state, submission history, and debug actions.
 * Inspired by TanStack Query DevTools.
 *
 * **Zero external dependencies** (beyond React and RHF).
 * **Tree-shakeable** – won't be included in production if not imported.
 *
 * @example
 * ```tsx
 * import { FormDevTool } from 'hookform-action-devtools'
 *
 * function App() {
 *   const form = useActionForm(action)
 *   return (
 *     <>
 *       <MyForm />
 *       {process.env.NODE_ENV === 'development' && (
 *         <FormDevTool control={form.control} />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export function FormDevTool<TFieldValues extends FieldValues = FieldValues>({
  control,
  position = 'bottom-right',
  defaultOpen = false,
}: FormDevToolProps<TFieldValues>) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [activeTab, setActiveTab] = useState<Tab>('state')
  const [_refreshKey, setRefreshKey] = useState(0)

  // Force re-render to pick up submission history changes
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 1000)
    return () => clearInterval(interval)
  }, [isOpen])

  // Get RHF form state
  const formState = useFormState({ control: control as Control<TFieldValues> })

  // Watch all field values
  const watchedValues = useWatch({ control: control as Control<TFieldValues> })

  // Get action form state from control
  const ctrl = control as unknown as Record<string, unknown>
  const actionFormState = ctrl?._actionFormState as ActionFormState<unknown> | undefined
  const submissionHistory = ctrl?._submissionHistory as SubmissionRecord<unknown>[] | undefined

  const togglePanel = useCallback(() => setIsOpen((o) => !o), [])

  // ---- Render: Toggle button ----------------------------------------------

  const toggleButton = (
    <button
      type="button"
      onClick={togglePanel}
      style={getToggleStyles(position)}
      title="Toggle Form DevTools"
      aria-label="Toggle Form DevTools"
    >
      {isOpen ? '✕' : '🔍'}
    </button>
  )

  if (!isOpen) return toggleButton

  // ---- State Tab ----------------------------------------------------------

  const stateContent = (
    <div>
      {/* Action Form State */}
      <div style={sectionTitle}>Action State</div>
      <div style={kvRow}>
        <span style={keyStyle}>isSubmitting</span>
        <span style={badgeStyle(actionFormState?.isSubmitting ? COLORS.warning : COLORS.success)}>
          {String(actionFormState?.isSubmitting ?? formState.isSubmitting)}
        </span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>isPending</span>
        <span style={badgeStyle(actionFormState?.isPending ? COLORS.warning : COLORS.success)}>
          {String(actionFormState?.isPending ?? false)}
        </span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>isSubmitSuccessful</span>
        <span
          style={badgeStyle(
            actionFormState?.isSubmitSuccessful ? COLORS.success : COLORS.textMuted,
          )}
        >
          {String(actionFormState?.isSubmitSuccessful ?? formState.isSubmitSuccessful)}
        </span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>submitCount</span>
        <span style={valueStyle}>{formState.submitCount}</span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>isDirty</span>
        <span style={badgeStyle(formState.isDirty ? COLORS.warning : COLORS.success)}>
          {String(formState.isDirty)}
        </span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>isValid</span>
        <span style={badgeStyle(formState.isValid ? COLORS.success : COLORS.error)}>
          {String(formState.isValid)}
        </span>
      </div>

      {/* Current Values */}
      <div style={{ ...sectionTitle, marginTop: 16 }}>Current Values</div>
      {watchedValues && typeof watchedValues === 'object' ? (
        Object.entries(watchedValues as Record<string, unknown>).map(([key, value]) => (
          <div key={key} style={kvRow}>
            <span style={keyStyle}>{key}</span>
            <span style={valueStyle} title={String(value ?? '')}>
              {value === undefined ? 'undefined' : value === null ? 'null' : String(value)}
            </span>
          </div>
        ))
      ) : (
        <div style={{ color: COLORS.textMuted, fontSize: 12 }}>No values</div>
      )}

      {/* Errors */}
      <div style={{ ...sectionTitle, marginTop: 16 }}>Errors</div>
      {formState.errors && Object.keys(formState.errors).length > 0 ? (
        Object.entries(formState.errors).map(([key, error]) => (
          <div key={key} style={kvRow}>
            <span style={{ ...keyStyle, color: COLORS.error }}>{key}</span>
            <span style={{ ...valueStyle, color: COLORS.error }}>
              {String((error as Record<string, unknown>)?.message ?? 'Error')}
            </span>
          </div>
        ))
      ) : (
        <div style={{ color: COLORS.success, fontSize: 12 }}>✓ No errors</div>
      )}

      {/* Submit Errors (from server) */}
      {actionFormState?.submitErrors && (
        <>
          <div style={{ ...sectionTitle, marginTop: 16 }}>Server Errors</div>
          {Object.entries(actionFormState.submitErrors).map(([key, messages]) => (
            <div key={key} style={kvRow}>
              <span style={{ ...keyStyle, color: COLORS.error }}>{key}</span>
              <span style={{ ...valueStyle, color: COLORS.error }}>
                {(messages ?? []).join(', ')}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )

  // ---- History Tab --------------------------------------------------------

  const historyContent = (
    <div>
      <div style={sectionTitle}>Submission History ({submissionHistory?.length ?? 0})</div>
      {submissionHistory && submissionHistory.length > 0 ? (
        [...submissionHistory].reverse().map((record) => (
          <div key={record.id} style={historyItemStyle(record.success)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={badgeStyle(record.success ? COLORS.success : COLORS.error)}>
                {record.success ? 'SUCCESS' : 'FAILED'}
              </span>
              <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{record.duration}ms</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>
              {new Date(record.timestamp).toLocaleTimeString()}
            </div>
            <div style={{ fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: COLORS.textMuted }}>Payload: </span>
              <span style={{ color: COLORS.text }}>
                {JSON.stringify(record.payload).slice(0, 100)}
                {JSON.stringify(record.payload).length > 100 ? '…' : ''}
              </span>
            </div>
            {record.response != null && (
              <div style={{ fontSize: 11 }}>
                <span style={{ color: COLORS.textMuted }}>Response: </span>
                <span style={{ color: COLORS.text }}>
                  {String(JSON.stringify(record.response)).slice(0, 100)}
                  {String(JSON.stringify(record.response)).length > 100 ? '…' : ''}
                </span>
              </div>
            )}
            {record.error && (
              <div style={{ fontSize: 11, color: COLORS.error }}>Error: {record.error.message}</div>
            )}
          </div>
        ))
      ) : (
        <div style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center', padding: 24 }}>
          No submissions yet
        </div>
      )}
    </div>
  )

  // ---- Actions Tab --------------------------------------------------------

  const actionsContent = (
    <div>
      <div style={sectionTitle}>Debug Actions</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          style={actionBtnStyle}
          onClick={() => {
            // Force a simulated success by dispatching to action state
            // This is a read-only view, but we can still trigger re-renders
            console.log('[FormDevTool] Current values:', watchedValues)
          }}
          title="Log current form values to console"
        >
          📋 Log Values
        </button>
        <button
          type="button"
          style={actionBtnStyle}
          onClick={() => {
            console.log('[FormDevTool] Form state:', {
              ...formState,
              actionFormState,
            })
          }}
          title="Log full form state to console"
        >
          📊 Log State
        </button>
        <button
          type="button"
          style={actionBtnStyle}
          onClick={() => {
            console.log('[FormDevTool] Submission history:', submissionHistory)
          }}
          title="Log submission history to console"
        >
          📜 Log History
        </button>
        <button
          type="button"
          style={{
            ...actionBtnStyle,
            borderColor: COLORS.error,
            color: COLORS.error,
          }}
          onClick={() => {
            console.log('[FormDevTool] Errors:', formState.errors)
            console.log('[FormDevTool] Server errors:', actionFormState?.submitErrors)
          }}
          title="Log all errors to console"
        >
          ⚠️ Log Errors
        </button>
      </div>

      <div style={{ ...sectionTitle, marginTop: 24 }}>Form Info</div>
      <div style={kvRow}>
        <span style={keyStyle}>Total Submissions</span>
        <span style={valueStyle}>{submissionHistory?.length ?? 0}</span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>Successful</span>
        <span style={{ ...valueStyle, color: COLORS.success }}>
          {submissionHistory?.filter((r) => r.success).length ?? 0}
        </span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>Failed</span>
        <span style={{ ...valueStyle, color: COLORS.error }}>
          {submissionHistory?.filter((r) => !r.success).length ?? 0}
        </span>
      </div>
      <div style={kvRow}>
        <span style={keyStyle}>Avg Duration</span>
        <span style={valueStyle}>
          {submissionHistory && submissionHistory.length > 0
            ? `${Math.round(submissionHistory.reduce((a, r) => a + r.duration, 0) / submissionHistory.length)}ms`
            : 'N/A'}
        </span>
      </div>
    </div>
  )

  // ---- Panel Layout -------------------------------------------------------

  return (
    <>
      {toggleButton}
      <dialog open style={getPanelStyles(position)} aria-label="Form DevTools">
        {/* Header */}
        <div style={headerStyle}>
          <span>🔍 Form DevTools</span>
          <span
            style={badgeStyle(
              actionFormState?.isSubmitting
                ? COLORS.warning
                : actionFormState?.isSubmitSuccessful
                  ? COLORS.success
                  : COLORS.badge,
            )}
          >
            {actionFormState?.isSubmitting
              ? 'Submitting'
              : actionFormState?.isSubmitSuccessful
                ? 'Success'
                : 'Idle'}
          </span>
        </div>

        {/* Tab Bar */}
        <div style={tabBarStyle}>
          <button
            type="button"
            style={tabStyle(activeTab === 'state')}
            onClick={() => setActiveTab('state')}
          >
            📋 State
          </button>
          <button
            type="button"
            style={tabStyle(activeTab === 'history')}
            onClick={() => setActiveTab('history')}
          >
            📜 History ({submissionHistory?.length ?? 0})
          </button>
          <button
            type="button"
            style={tabStyle(activeTab === 'actions')}
            onClick={() => setActiveTab('actions')}
          >
            ⚡ Actions
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {activeTab === 'state' && stateContent}
          {activeTab === 'history' && historyContent}
          {activeTab === 'actions' && actionsContent}
        </div>
      </dialog>
    </>
  )
}
