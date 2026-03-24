export declare class AppValidationError extends Error {
    readonly issues: Array<{
        path: string;
        message: string;
    }>;
    readonly name = "AppValidationError";
    constructor(message: string, issues: Array<{
        path: string;
        message: string;
    }>);
}
export declare function isAppValidationError(e: unknown): e is AppValidationError;
//# sourceMappingURL=appError.d.ts.map