export type HoldStatus = "Open" | "Closed" | "Pending";
export interface HoldEntryDocument {
    _id?: string;
    holdId: string;
    schemaKey: string;
    schemaVersion: string;
    status: HoldStatus;
    data: Record<string, unknown>;
    timestamps: {
        createdAt: Date;
        updatedAt: Date;
    };
}
//# sourceMappingURL=holdEntry.d.ts.map