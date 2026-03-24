"use client";

import { useState, useCallback } from "react";
import { useHoldForm } from "@/context/HoldFormContext";
import { SchemaForm } from "@/components/SchemaForm";
import "@/components/SchemaForm.css";

function formatDateForApi(dateStr: string): string {
  if (!dateStr) return dateStr;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[2]}/${match[3]}/${match[1]}`;
  }
  return dateStr;
}

export function FormPanel() {
  const {
    active,
    schemaKey,
    schema,
    fieldOptions,
    formInstanceKey,
    respondRef,
    setDraftValues,
    setLastSubmission,
  } = useHoldForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      const respond = respondRef.current;
      if (!respond) return;

      const normalized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v === undefined || v === null || v === "") continue;
        if (k === "prodDate" && typeof v === "string") {
          normalized[k] = formatDateForApi(v);
        } else if (
          (k === "dispositionProvidedTargetDate" || k === "dispositionActionTargetDate") &&
          typeof v === "string"
        ) {
          normalized[k] = formatDateForApi(v);
        } else {
          normalized[k] = v;
        }
      }

      const json = JSON.stringify(normalized);
      setLastSubmission(json);
      setSubmitting(true);
      try {
        await respond(json);
      } finally {
        setSubmitting(false);
      }
    },
    [respondRef, setLastSubmission]
  );

  return (
    <section className="form-panel" aria-label="Hold entry form">
      <header className="form-panel-header">
        <h1>ThresHOLD</h1>
        <p className="form-panel-subtitle">
          Fill the form on the left; ask the assistant on the right. The assistant sees your draft
          fields and your last submit.
        </p>
      </header>

      {!active || !schema?.fieldConfig?.fields?.length ? (
        <div className="form-panel-empty">
          <p>
            No form is open yet. Ask the assistant to start a hold entry—it will load the form here.
          </p>
          <p className="form-panel-hint">
            You can also work entirely in chat; the assistant can use tools without this form.
          </p>
        </div>
      ) : (
        <div className="form-panel-body" key={formInstanceKey}>
          <p className="form-panel-schema-key">{schemaKey}</p>
          <SchemaForm
            schemaKey={schemaKey ?? "hold_entry:add:v1"}
            schema={schema as Parameters<typeof SchemaForm>[0]["schema"]}
            fieldOptions={fieldOptions as Record<string, string | Record<string, string>>}
            onValuesChange={setDraftValues}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>
      )}
    </section>
  );
}
