const COLLECTION = "counters";
export function createCounterRepository(db) {
    const col = db.collection(COLLECTION);
    return {
        async getNextSequence(counterKey) {
            const result = await col.findOneAndUpdate({ _id: counterKey }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" });
            return result?.seq ?? 1;
        },
    };
}
//# sourceMappingURL=counterRepository.js.map