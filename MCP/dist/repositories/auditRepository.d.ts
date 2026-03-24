import type { Db } from "mongodb";
export declare function createAuditRepository(db: Db): {
    insert(event: Record<string, unknown>): Promise<string>;
};
//# sourceMappingURL=auditRepository.d.ts.map