import { isAppValidationError } from "../domain/appError.js";
/**
 * Maps shared {@link AppValidationError} to an MCP tool error the model can relay to the user.
 */
export async function withValidationToolResult(run) {
    try {
        return await run();
    }
    catch (e) {
        if (isAppValidationError(e)) {
            const detail = e.issues.map((i) => `• ${i.path}: ${i.message}`).join("\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `Validation failed. Fix these fields and try again:\n${detail}`,
                    },
                ],
                isError: true,
            };
        }
        throw e;
    }
}
//# sourceMappingURL=mcpToolResult.js.map