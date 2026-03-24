export type AuditAction = "hold_entry.created" | "hold_entry.updated" | "hold_entry.closed" | "schema.accessed" | "datasource.resolved";
export interface AuditEventDocument {
    _id?: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    payload?: Record<string, unknown>;
    requestId?: string;
    timestamp: Date;
}
//# sourceMappingURL=audit.d.ts.map