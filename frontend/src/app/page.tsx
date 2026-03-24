"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { HoldFormProvider } from "@/context/HoldFormContext";
import { FormPanel } from "@/components/FormPanel";
import { CopilotFormReadable } from "@/components/CopilotFormReadable";
import { FormActions } from "./FormActions";

const CHAT_INSTRUCTIONS = `Workspace layout: LEFT = structured hold entry form, RIGHT = this chat.
The user may type in either place. Copilot readable context includes "Left panel hold form" with formOpen, schemaKey, draft field values (draftValues), and lastFormSubmissionJson after they submit the left form.
When showFormFromSchema runs, the form appears on the left; after Submit, you receive JSON from that action—then use preview_hold_entry and create_record as usual.`;

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
                "Hi! I can help you create hold entries, search MO/batch numbers, and list holds. I can open the form on the left or work with you here in chat. What would you like to do?",
            }}
          />
        </aside>
        <FormActions />
        <CopilotFormReadable />
      </div>
    </HoldFormProvider>
  );
}
