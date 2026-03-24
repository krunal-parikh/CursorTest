const COLLECTION = "audit_events";
export function createAuditRepository(db) {
    const col = db.collection(COLLECTION);
    return {
        async insert(event) {
            const result = await col.insertOne(event);
            return result.insertedId.toString();
        },
    };
}
//# sourceMappingURL=auditRepository.js.map