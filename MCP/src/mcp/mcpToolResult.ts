import { isAppValidationError } from "../domain/appError.js";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

/**
 * Maps shared {@link AppValidationError} to an MCP tool error the model can relay to the user.
 */
export async function withValidationToolResult(
  run: () => Promise<ToolResult>
): Promise<ToolResult> {
  try {
    return await run();
  } catch (e) {
    if (isAppValidationError(e)) {
      const detail = e.issues.map((i) => `• ${i.path}: ${i.message}`).join("\n");
      return {
        content: [
          {
            type: "text" as const,
            text: `Validation failed. Fix these fields and try again:\n${detail}`,
          },
        ],
        isError: true,
      };
    }
    throw e;
  }
}
