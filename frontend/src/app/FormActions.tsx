"use client";

import { useEffect, useRef } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { useHoldForm } from "@/context/HoldFormContext";
import type { RenderFunctionStatus } from "@copilotkit/react-core";
import type { Schema } from "@/types/schema";

type ShowFormArgs = {
  schemaKey?: string;
  schema?: Schema;
  fieldOptions?: Record<string, unknown>;
};

function ShowFormBridge(props: {
  status: RenderFunctionStatus;
  args: Partial<ShowFormArgs>;
  respond?: (result: string) => void;
}) {
  const { openForm } = useHoldForm();
  const lastRespondRef = useRef<((result: string) => void) | undefined>(undefined);

  useEffect(() => {
    if (props.status !== "executing" || !props.respond) return;
    if (lastRespondRef.current === props.respond) return;
    lastRespondRef.current = props.respond;

    const schema = props.args.schema;
    const schemaKey =
      (props.args.schemaKey as string) || schema?.schemaKey || "hold_entry:add:v1";

    if (!schema?.fieldConfig?.fields?.length) {
      void props.respond(
        JSON.stringify({
          error: "invalid_schema",
          message: "Schema missing fieldConfig.fields. Call get_schema first.",
        })
      );
      return;
    }

    openForm({
      schemaKey,
      schema: schema as Schema,
      fieldOptions: props.args.fieldOptions ?? {},
      respond: props.respond,
    });
  }, [props.status, props.respond, props.args, openForm]);

  return null;
}

export function FormActions() {
  const { updateField, setFieldValues, getCompletionStatus, draftValues, schema } = useHoldForm();

  useCopilotAction({
    name: "showFormFromSchema",
    description: `Opens the hold entry form on the LEFT panel. The user fills fields and clicks Submit—you receive JSON via this action.`,
    parameters: [
      {
        name: "schemaKey",
        type: "string",
        description: "Schema key (e.g. hold_entry:add:v1)",
        required: true,
      },
      {
        name: "schema",
        type: "object",
        description: "Full schema object from get_schema - must include fieldConfig.fields array",
        required: true,
      },
      {
        name: "fieldOptions",
        type: "object",
        description: "Optional field options for dropdowns",
        required: false,
      },
    ],
    renderAndWaitForResponse: (p) => (
      <ShowFormBridge status={p.status} args={p.args as Partial<ShowFormArgs>} respond={p.respond} />
    ),
  });

  useCopilotAction({
    name: "updateFormField",
    description: `Set a single field value on the left panel form. The form UI updates in real-time. Use when user says things like "set category to Testing" or "use MO-003" or "set plant to PLT01". The field must match a field_name from the schema. For select fields, use the option VALUE (e.g. "PLT01" not "Plant 01").`,
    parameters: [
      {
        name: "fieldName",
        type: "string",
        description: "The field_name from the schema (e.g. 'plantCode', 'category', 'moBatchId')",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "The value to set (use the option value, not the label)",
        required: true,
      },
    ],
    handler: async ({ fieldName, value }) => {
      updateField(fieldName, value);
      const status = getCompletionStatus();
      return JSON.stringify({
        success: true,
        fieldName,
        value,
        completion: {
          requiredFilled: status.requiredFilled,
          requiredTotal: status.required,
          nextRequired: status.nextRequired
            ? {
                label: status.nextRequired.label,
                options: status.nextRequired.options?.map((o) => o.label ?? o.value) ?? [],
              }
            : null,
        },
      });
    },
  });

  useCopilotAction({
    name: "setMultipleFormFields",
    description: `Set multiple field values at once. Fields update in real-time on the form UI. Use for bulk updates like filling from previous data.`,
    parameters: [
      {
        name: "fields",
        type: "object",
        description: "Object mapping field_name to value, e.g. { plantCode: 'PLT01', category: 'Testing' }",
        required: true,
      },
    ],
    handler: async ({ fields }) => {
      const fieldObj = fields as Record<string, unknown>;
      setFieldValues(fieldObj);
      const status = getCompletionStatus();
      return JSON.stringify({
        success: true,
        updatedFields: Object.keys(fieldObj),
        completion: {
          requiredFilled: status.requiredFilled,
          requiredTotal: status.required,
          nextRequired: status.nextRequired?.label ?? null,
        },
      });
    },
  });

  useCopilotAction({
    name: "getFormStatus",
    description: `Get the current form completion status: which fields are filled, which required fields are missing, and what the next suggested field is.`,
    parameters: [],
    handler: async () => {
      const status = getCompletionStatus();
      const fields = schema?.fieldConfig?.fields ?? [];
      const filledFields = fields
        .filter((f) => {
          const v = draftValues[f.field_name];
          return v !== undefined && v !== null && v !== "";
        })
        .map((f) => ({ name: f.field_name, label: f.label, value: draftValues[f.field_name] }));
      const missingRequired = fields
        .filter((f) => {
          if (!f.required) return false;
          const v = draftValues[f.field_name];
          return v === undefined || v === null || v === "";
        })
        .map((f) => ({
          name: f.field_name,
          label: f.label,
          options: f.options?.map((o) => o.label ?? o.value) ?? [],
        }));

      return JSON.stringify({
        totalFields: status.total,
        filledFields,
        missingRequired,
        requiredFilled: status.requiredFilled,
        requiredTotal: status.required,
        isReadyToSubmit: status.requiredFilled === status.required,
        nextRequired: status.nextRequired
          ? {
              name: status.nextRequired.field_name,
              label: status.nextRequired.label,
              options: status.nextRequired.options?.map((o) => o.label ?? o.value) ?? [],
            }
          : null,
      });
    },
  });

  useCopilotAction({
    name: "fillPreviousEntryData",
    description: `Fills the form with data from the most recently created hold entry. Fetches the latest entry from the API and populates matching fields. Users click the "Fill previous entry" chip or ask "fill previous entry data" in chat. This is useful when creating similar hold entries.`,
    parameters: [],
    handler: async () => {
      try {
        const res = await fetch("/api/mcp-rest/hold-entries?limit=1&page=1");
        if (!res.ok) {
          return JSON.stringify({ success: false, error: "Could not fetch previous entries" });
        }
        const result = await res.json();
        const items = result.items ?? [];
        if (items.length === 0) {
          return JSON.stringify({ success: false, error: "No previous entries found" });
        }
        const lastEntry = items[0];
        const data = lastEntry.data ?? {};
        const toFill: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(data)) {
          if (val !== undefined && val !== null && val !== "") {
            toFill[key] = val;
          }
        }
        setFieldValues(toFill);
        const status = getCompletionStatus();
        return JSON.stringify({
          success: true,
          holdId: lastEntry.holdId,
          filledFields: Object.keys(toFill),
          completion: {
            requiredFilled: status.requiredFilled,
            requiredTotal: status.required,
            nextRequired: status.nextRequired?.label ?? null,
          },
        });
      } catch {
        return JSON.stringify({ success: false, error: "Failed to fetch previous entry" });
      }
    },
  });

  return null;
}
