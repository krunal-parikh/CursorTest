export type DatasourceType = "inline" | "collection" | "mo_lookup";
export interface InlineOption {
    value: string | number;
    label: string;
}
export interface DatasourceDocument {
    _id?: string;
    datasourceKey: string;
    type: DatasourceType;
    options?: InlineOption[];
    collectionName?: string;
    lookupFields?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ResolveInput {
    datasourceKey: string;
    search?: string;
    cursor?: string;
    limit?: number;
    lookupId?: string;
}
export interface ResolveResultItem {
    id: string;
    label?: string;
    [key: string]: unknown;
}
export interface ResolveResult {
    items: ResolveResultItem[];
    nextCursor?: string;
    total?: number;
}
//# sourceMappingURL=datasource.d.ts.map