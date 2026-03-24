import type { Db } from "mongodb";
import type { DatasourceResolver } from "./resolver.js";
import type { ResolveInput, ResolveResult } from "../../types/datasource.js";

export function createCollectionResolver(
  db: Db,
  key: string,
  collectionName: string,
  labelField: string,
  idField: string = "_id"
): DatasourceResolver {
  return {
    key,
    async resolve(input: ResolveInput): Promise<ResolveResult> {
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
      const mapped: import("../../types/datasource.js").ResolveResultItem[] = result.map(
        (doc: Record<string, unknown>) => ({
          id: (doc[idField]?.toString() ?? doc._id?.toString() ?? "") as string,
          label: doc[labelField] as string | undefined,
          ...doc,
        })
      );
      return {
        items: mapped,
        nextCursor: hasMore ? String(cursor + limit) : undefined,
      };
    },
  };
}
