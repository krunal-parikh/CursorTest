"use client";

import { useMemo } from "react";
import { useCopilotReadable } from "@copilotkit/react-core";
import { useHoldForm } from "@/context/HoldFormContext";

/**
 * Pushes left-panel form state into Copilot context so the agent can reason about drafts and submissions.
 */
export function CopilotFormReadable() {
  const {
    active,
    schemaKey,
    draftValues,
    lastSubmissionJson,
  } = useHoldForm();

  const readable = useMemo(() => {
    const filledKeys = Object.entries(draftValues)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k]) => k);
    return {
      panel: "left_hold_form",
      formOpen: active,
      schemaKey: schemaKey ?? null,
      fieldsWithValues: filledKeys,
      draftValues,
      lastFormSubmissionJson: lastSubmissionJson,
    };
  }, [active, schemaKey, draftValues, lastSubmissionJson]);

  useCopilotReadable(
    {
      description:
        "Left panel: hold entry form state. draftValues = current in-progress field values the user is typing. lastFormSubmissionJson = JSON from the last time they clicked Submit on that form (then continue with preview_hold_entry / create_record). formOpen indicates whether the structured form is visible.",
      value: readable,
    },
    [readable]
  );

  return null;
}
