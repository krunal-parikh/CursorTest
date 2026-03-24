"use client";

import { useMemo } from "react";
import { useCopilotReadable } from "@copilotkit/react-core";
import { useHoldForm } from "@/context/HoldFormContext";

/**
 * Pushes detailed left-panel form state into Copilot context so the agent
 * can reason about drafts, know what field changed, and suggest the next step.
 */
export function CopilotFormReadable() {
  const {
    active,
    schemaKey,
    schema,
    draftValues,
    lastSubmissionJson,
    lastChangedField,
    getCompletionStatus,
  } = useHoldForm();

  const readable = useMemo(() => {
    const fields = schema?.fieldConfig?.fields ?? [];
    const status = active
      ? getCompletionStatus()
      : { total: 0, filled: 0, required: 0, requiredFilled: 0, nextRequired: undefined };

    const fieldDetails = fields.map((f) => {
      const v = draftValues[f.field_name];
      const isFilled = v !== undefined && v !== null && v !== "";
      return {
        name: f.field_name,
        label: f.label,
        type: f["ui.component"],
        required: !!f.required,
        filled: isFilled,
        currentValue: isFilled ? v : null,
        options: f.options?.map((o) => o.label ?? o.value) ?? [],
        hasDatasource: !!f.datasourceRef,
      };
    });

    return {
      panel: "left_hold_form",
      formOpen: active,
      schemaKey: schemaKey ?? null,
      completion: {
        totalFields: status.total,
        filledFields: status.filled,
        requiredFields: status.required,
        requiredFilled: status.requiredFilled,
        isComplete: status.requiredFilled === status.required && status.required > 0,
        nextRequiredField: status.nextRequired
          ? {
              name: status.nextRequired.field_name,
              label: status.nextRequired.label,
              type: status.nextRequired["ui.component"],
              options: status.nextRequired.options?.map((o) => o.label ?? o.value) ?? [],
            }
          : null,
      },
      lastChangedField: lastChangedField
        ? {
            fieldName: lastChangedField.fieldName,
            label: lastChangedField.label,
            value: lastChangedField.value,
          }
        : null,
      fields: fieldDetails,
      draftValues,
      lastFormSubmissionJson: lastSubmissionJson,
    };
  }, [active, schemaKey, schema, draftValues, lastSubmissionJson, lastChangedField, getCompletionStatus]);

  useCopilotReadable(
    {
      description: `Left panel: hold entry form state. IMPORTANT — read this context to understand what the user is doing on the form.

Key signals:
- "completion" shows how many fields are filled vs required, and which field to suggest next.
- "lastChangedField" tells you which field the user just modified — acknowledge it and guide them to the next field.
- "fields" array has every field with its current value, whether it's filled, and available dropdown options.
- "draftValues" has the raw current values.
- "lastFormSubmissionJson" has the JSON from the last Submit click.

When the user fills a field, acknowledge it briefly and suggest the next unfilled required field with its available options. Be conversational and helpful.`,
      value: readable,
    },
    [readable]
  );

  return null;
}
