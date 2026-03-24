export function createCollectionResolver(db, key, collectionName, labelField, idField = "_id") {
    return {
        key,
        async resolve(input) {
            const collection = db.collection(collectionName);
            const search = input.search ?? "";
            const limit = Math.min(input.limit ?? 20, 100);
            const cursor = input.cursor ? parseInt(input.cursor, 10) || 0 : 0;
            const filter = search
                ? { [labelField]: { $regex: search, $options: "i" } }
                : {};
            const items = await collection
                .find(filter)
                .skip(cursor)
                .limit(limit + 1)
                .toArray();
            const hasMore = items.length > limit;
            const result = hasMore ? items.slice(0, limit) : items;
            const mapped = result.map((doc) => ({
                id: (doc[idField]?.toString() ?? doc._id?.toString() ?? ""),
                label: doc[labelField],
                ...doc,
            }));
            return {
                items: mapped,
                nextCursor: hasMore ? String(cursor + limit) : undefined,
            };
        },
    };
}
//# sourceMappingURL=collectionResolver.js.map