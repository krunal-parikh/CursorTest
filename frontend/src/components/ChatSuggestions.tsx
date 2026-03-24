"use client";

import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useHoldForm } from "@/context/HoldFormContext";

/**
 * Dynamic CopilotKit suggestion chips that adapt to form state.
 * Shows contextual quick-actions as clickable chips in the chat UI.
 */
export function ChatSuggestions() {
  const { active, lastSubmissionJson, getCompletionStatus, draftValues, lastChangedField } = useHoldForm();

  const status = active ? getCompletionStatus() : null;
  const hasSubmission = !!lastSubmissionJson;
  const isComplete = status?.requiredFilled === status?.required && (status?.required ?? 0) > 0;
  const hasDraft = Object.values(draftValues).some(
    (v) => v !== undefined && v !== null && v !== ""
  );

  useCopilotChatSuggestions(
    {
      suggestions: [
        {
          title: "Fill previous entry",
          message: "Fill the form with data from my last submitted hold entry",
        },
        {
          title: "Start new hold",
          message: "Help me create a new hold entry from scratch",
        },
        {
          title: "Search holds",
          message: "Search for existing hold entries",
        },
      ],
      available: "before-first-message",
    },
    []
  );

  useCopilotChatSuggestions(
    {
      instructions: `Based on the current form state, suggest 2-3 short contextual actions.
Current state:
- Form open: ${active}
- Fields filled: ${status?.filled ?? 0}/${status?.total ?? 0}
- Required filled: ${status?.requiredFilled ?? 0}/${status?.required ?? 0}
- All required complete: ${isComplete}
- Has previous submission: ${hasSubmission}
- Last changed field: ${lastChangedField?.label ?? "none"} = ${lastChangedField?.value ?? "none"}
- Next required: ${status?.nextRequired?.label ?? "none"}
${status?.nextRequired?.options?.length ? `- Next field options: ${status.nextRequired.options.map((o) => o.label ?? o.value).join(", ")}` : ""}

Rules:
- If not all required fields are filled, suggest filling the next required field with a specific option.
- If all required fields are filled, suggest "Preview and submit" or "Add optional details".
- If there's a previous submission, suggest "Fill previous entry data".
- Always keep suggestions SHORT (3-6 words) and actionable.
- Suggestions are shown as clickable chips, so make them natural chat messages.`,
      minSuggestions: 2,
      maxSuggestions: 3,
      available: "after-first-message",
    },
    [active, status?.filled, status?.requiredFilled, isComplete, hasSubmission, lastChangedField?.fieldName]
  );

  return null;
}
