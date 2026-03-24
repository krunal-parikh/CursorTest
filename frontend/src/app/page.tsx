"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { HoldFormProvider } from "@/context/HoldFormContext";
import { FormPanel } from "@/components/FormPanel";
import { CopilotFormReadable } from "@/components/CopilotFormReadable";
import { ChatSuggestions } from "@/components/ChatSuggestions";
import { FormActions } from "./FormActions";

const CHAT_INSTRUCTIONS = `You are the ThresHOLD assistant. The workspace has two panels:
LEFT = structured hold entry form (auto-loaded from schema), RIGHT = this chat.

CRITICAL RULES:
1. You have real-time awareness of the form via "left_hold_form" readable context. ALWAYS use it.
2. When the user fills a field on the form, check "lastChangedField", acknowledge briefly, and suggest the next required field with its options.
3. When the user asks you to set a field (e.g. "set category to Testing"), use updateFormField. The form updates INSTANTLY.
4. For multiple fields, use setMultipleFormFields.
5. When user says "fill previous entry" or clicks that chip, use fillPreviousEntryData.
6. After all required fields are filled, suggest Submit or offer preview_hold_entry.
7. After Submit, use lastFormSubmissionJson → preview_hold_entry → create_record after confirmation.

FIELD VALUES for updateFormField (use these exact values, not labels):
- plantCode: PLT01, PLT02, PLT03
- category: Product Safety RedFlag, Product Quality RedFlag, Testing, Trials, Documentation, Inventory Management, Return Hold
- subCategory: Appearance, Taste/Aroma, Metrics, Incoming Supply Quality
- observation: Topping, Texture, Shape, Packaging Orientation, Other Quality, Damaged, Color
- plantRelated: Yes, No
- location: LOC1, CRE1, CON1, CON2, CON4, LIN3, NEW2
- status: Disposition Due, Disposition in Progress, Disposition Provided, Disposition Completed, Closed
- dispositionProvider/dispositionActor: QA, PROD, PLM, R&D, MM
- disposition: N/A, Disposition Due, Approved & Release, Rejected & Dispose, Rework & Release

Keep responses concise and actionable. Use plain language. Never expose schema keys.`;

export default function Home() {
  return (
    <HoldFormProvider>
      <div className="workspace">
        <FormPanel />
        <aside className="chat-column" aria-label="Assistant chat">
          <div className="chat-column-header">
            <span className="chat-dot" />
            <h2>AI Assistant</h2>
          </div>
          <CopilotChat
            className="workspace-chat"
            instructions={CHAT_INSTRUCTIONS}
            labels={{
              title: "ThresHOLD Assistant",
              initial:
                "Hi! The hold entry form is loaded on the left. Start filling it out — I'll guide you field by field. Or just tell me what to fill and I'll update the form for you!",
            }}
          />
        </aside>
        <FormActions />
        <CopilotFormReadable />
        <ChatSuggestions />
      </div>
    </HoldFormProvider>
  );
}
