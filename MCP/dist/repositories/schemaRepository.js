const COLLECTION = "schemas";
export function createSchemaRepository(db) {
    const col = db.collection(COLLECTION);
    return {
        async findByKey(schemaKey) {
            return col.findOne({ schemaKey, active: true }, { sort: { updatedAt: -1 } });
        },
        async findByKeyAndVersion(schemaKey, version) {
            return col.findOne({ schemaKey, version, active: true });
        },
        async insert(schema) {
            const now = new Date();
            const doc = { ...schema, createdAt: now, updatedAt: now };
            const result = await col.insertOne(doc);
            return result.insertedId.toString();
        },
        async upsert(schema) {
            const now = new Date();
            await col.updateOne({ schemaKey: schema.schemaKey, version: schema.version }, { $set: { ...schema, updatedAt: now } }, { upsert: true });
        },
    };
}
//# sourceMappingURL=schemaRepository.js.map