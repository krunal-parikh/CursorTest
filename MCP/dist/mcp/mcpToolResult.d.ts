type ToolResult = {
    content: Array<{
        type: "text";
        text: string;
    }>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
};
/**
 * Maps shared {@link AppValidationError} to an MCP tool error the model can relay to the user.
 */
export declare function withValidationToolResult(run: () => Promise<ToolResult>): Promise<ToolResult>;
export {};
//# sourceMappingURL=mcpToolResult.d.ts.map