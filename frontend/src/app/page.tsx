"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { HoldFormProvider } from "@/context/HoldFormContext";
import { FormPanel } from "@/components/FormPanel";
import { CopilotFormReadable } from "@/components/CopilotFormReadable";
import { FormActions } from "./FormActions";

const CHAT_INSTRUCTIONS = `You are the ThresHOLD assistant. The workspace has two panels:
LEFT = structured hold entry form (auto-loaded from schema), RIGHT = this chat.

CRITICAL: You have real-time awareness of the form via "left_hold_form" readable context. USE IT.

When the user fills a field on the form:
1. Check "lastChangedField" to see what they just changed
2. Acknowledge it briefly (e.g. "Got it, Plant set to PLT01.")
3. Look at "completion.nextRequiredField" and suggest it with its available options
4. Example: "Next up: Category. Options are: Product Safety RedFlag, Product Quality RedFlag, Testing, Trials, Documentation, Inventory Management, Return Hold."

You can also SET form fields from chat using:
- updateFormField: set a single field (e.g. user says "set plant to PLT01")
- setMultipleFormFields: set multiple fields at once
- getFormStatus: check what's filled and what's missing

The form auto-populates SKU Number, SKU Description, and Plant when MO/Batch is selected (via datasource lookup).

When all required fields are filled (completion.isComplete = true), suggest the user click Submit or offer to preview with preview_hold_entry.

After Submit, use the lastFormSubmissionJson to call preview_hold_entry, then create_record only after user confirms.

Keep responses short and action-oriented. Always reference the actual field labels (not field_names). Never expose schema keys or technical IDs to the user.`;

export default function Home() {
  return (
    <HoldFormProvider>
      <div className="workspace">
        <FormPanel />
        <aside className="chat-column" aria-label="Assistant chat">
          <CopilotChat
            className="workspace-chat"
            instructions={CHAT_INSTRUCTIONS}
            labels={{
              title: "ThresHOLD Assistant",
              initial:
                "Hi! The hold entry form is loaded on the left. Start filling it out and I'll guide you through each field — or tell me values in chat and I'll fill them for you!",
            }}
          />
        </aside>
        <FormActions />
        <CopilotFormReadable />
      </div>
    </HoldFormProvider>
  );
}
