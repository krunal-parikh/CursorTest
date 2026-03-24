export class AppValidationError extends Error {
    issues;
    name = "AppValidationError";
    constructor(message, issues) {
        super(message);
        this.issues = issues;
    }
}
export function isAppValidationError(e) {
    return e instanceof AppValidationError;
}
//# sourceMappingURL=appError.js.map