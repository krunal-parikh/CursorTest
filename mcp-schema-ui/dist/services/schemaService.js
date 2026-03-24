const COLLECTION = "schemas";
export async function listSchemas(db) {
    const col = db.collection(COLLECTION);
    const docs = await col
        .find({ active: true })
        .sort({ schemaKey: 1, updatedAt: -1 })
        .project({ schemaKey: 1, version: 1 })
        .toArray();
    return docs.map((d) => ({ schemaKey: d.schemaKey, version: d.version }));
}
export async function getSchema(db, schemaKey) {
    const col = db.collection(COLLECTION);
    return col.findOne({ schemaKey, active: true }, { sort: { updatedAt: -1 } });
}
//# sourceMappingURL=schemaService.js.map