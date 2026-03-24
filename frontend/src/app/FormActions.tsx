"use client";

import { useEffect, useRef } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { useHoldForm } from "@/context/HoldFormContext";
import type { RenderFunctionStatus } from "@copilotkit/react-core";

type ShowFormArgs = {
  schemaKey?: string;
  schema?: {
    schemaKey?: string;
    fieldConfig?: { fields: Array<Record<string, unknown>> };
  };
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

    const schema = props.args.schema as ShowFormArgs["schema"];
    const schemaKey =
      (props.args.schemaKey as string) || schema?.schemaKey || "hold_entry:add:v1";
    const fieldOptions = (props.args.fieldOptions as Record<string, unknown>) || {};

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
      schema: {
        schemaKey,
        fieldConfig: schema.fieldConfig,
      },
      fieldOptions,
      respond: props.respond,
    });
  }, [props.status, props.respond, props.args, openForm]);

  return null;
}

export function FormActions() {
  useCopilotAction({
    name: "showFormFromSchema",
    description: `Opens the hold entry form on the LEFT panel (not inside chat). The same validation and flow apply: get_schema / get_hold_entry_options, then showFormFromSchema with schemaKey, schema, optional fieldOptions. The user fills the left form and clicks Submit—you receive JSON via this action. Copilot readable context includes their live draft fields. Then call preview_hold_entry and create_record. You can also skip the form and use MCP tools only.`,
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
        description: "Optional field options from get_hold_entry_options (section1, section2) for dropdowns",
        required: false,
      },
    ],
    renderAndWaitForResponse: (p) => (
      <ShowFormBridge status={p.status} args={p.args as Partial<ShowFormArgs>} respond={p.respond} />
    ),
  });

  return null;
}
