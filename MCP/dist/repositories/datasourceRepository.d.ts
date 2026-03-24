import type { Db } from "mongodb";
export declare function createDatasourceRepository(db: Db): {
    findByKey(datasourceKey: string): Promise<Record<string, unknown> | null>;
    insert(datasource: Record<string, unknown>): Promise<string>;
};
//# sourceMappingURL=datasourceRepository.d.ts.map