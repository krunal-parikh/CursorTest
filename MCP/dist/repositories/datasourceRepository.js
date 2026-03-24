const COLLECTION = "datasources";
export function createDatasourceRepository(db) {
    const col = db.collection(COLLECTION);
    return {
        async findByKey(datasourceKey) {
            return col.findOne({ datasourceKey });
        },
        async insert(datasource) {
            const now = new Date();
            const doc = { ...datasource, createdAt: now, updatedAt: now };
            const result = await col.insertOne(doc);
            return result.insertedId.toString();
        },
    };
}
//# sourceMappingURL=datasourceRepository.js.map