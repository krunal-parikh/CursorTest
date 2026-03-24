"use client";

import { useState, useCallback, useEffect } from "react";
import { useHoldForm } from "@/context/HoldFormContext";
import { SchemaForm } from "@/components/SchemaForm";
import type { Schema } from "@/types/schema";
import "@/components/SchemaForm.css";

const DEFAULT_SCHEMA_KEY = "hold_entry:add:v1";

function formatDateForApi(dateStr: string): string {
  if (!dateStr) return dateStr;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  return dateStr;
}

function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const isComplete = filled === total && total > 0;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-bar-label">
        <span>
          {filled}/{total} required
        </span>
        {isComplete ? (
          <span className="complete">Ready to submit</span>
        ) : (
          <span>{pct}%</span>
        )}
      </div>
    </div>
  );
}

export function FormPanel() {
  const {
    active,
    schemaKey,
    schema,
    draftValues,
    errors,
    formInstanceKey,
    respondRef,
    openForm,
    updateField,
    setFieldValues,
    setErrors,
    setLastSubmission,
    getCompletionStatus,
  } = useHoldForm();
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [autoLoading, setAutoLoading] = useState(false);

  useEffect(() => {
    if (active) return;
    let cancelled = false;
    async function loadSchema() {
      setAutoLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/mcp-rest/schemas/${DEFAULT_SCHEMA_KEY}`);
        if (!res.ok) {
          setLoadError("Could not load schema. Make sure the MCP backend is running.");
          return;
        }
        const data = (await res.json()) as Schema;
        if (cancelled) return;
        openForm({
          schemaKey: data.schemaKey ?? DEFAULT_SCHEMA_KEY,
          schema: data,
        });
      } catch {
        if (!cancelled) setLoadError("Failed to connect to the backend.");
      } finally {
        if (!cancelled) setAutoLoading(false);
      }
    }
    loadSchema();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAutoPopulate = useCallback(
    (populated: Record<string, unknown>) => {
      setFieldValues(populated);
    },
    [setFieldValues]
  );

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      const normalized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v === undefined || v === null || v === "") continue;
        if (
          (k === "prodDate" ||
            k === "dispositionProvidedTargetDate" ||
            k === "dispositionActionTargetDate") &&
          typeof v === "string"
        ) {
          normalized[k] = formatDateForApi(v);
        } else {
          normalized[k] = v;
        }
      }

      const json = JSON.stringify(normalized);
      setLastSubmission(json);

      const respond = respondRef.current;
      if (respond) {
        setSubmitting(true);
        try {
          await respond(json);
        } finally {
          setSubmitting(false);
        }
      }
    },
    [respondRef, setLastSubmission]
  );

  const status = active ? getCompletionStatus() : null;

  return (
    <section className="form-panel" aria-label="Hold entry form">
      <header className="form-panel-header">
        <h1>ThresHOLD</h1>
        <p className="form-panel-subtitle">
          Fill in the form below or use the AI assistant on the right. Changes sync in real-time between both panels.
        </p>
      </header>

      {autoLoading && (
        <div className="form-panel-empty">
          <p>Loading form schema...</p>
        </div>
      )}

      {loadError && (
        <div className="form-panel-empty form-panel-error">
          <p>{loadError}</p>
        </div>
      )}

      {active && schema?.fieldConfig?.fields?.length ? (
        <div className="form-panel-body" key={formInstanceKey}>
          <div className="form-panel-meta">
            <span className="form-panel-schema-key">{schemaKey}</span>
            {status && status.nextRequired && (
              <span className="form-panel-progress">
                Next: <strong>{status.nextRequired.label}</strong>
              </span>
            )}
          </div>
          {status && (
            <ProgressBar filled={status.requiredFilled} total={status.required} />
          )}
          <SchemaForm
            schema={schema}
            values={draftValues}
            errors={errors}
            onFieldChange={updateField}
            onAutoPopulate={handleAutoPopulate}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>
      ) : (
        !autoLoading &&
        !loadError && (
          <div className="form-panel-empty">
            <p>
              No form is open yet. Ask the assistant to start a hold entry—it will
              load the form here.
            </p>
            <p className="form-panel-hint">
              You can also work entirely in chat; the assistant can use tools
              without this form.
            </p>
          </div>
        )
      )}
    </section>
  );
}
