import type { Db } from "mongodb";
export interface SchemaDocument {
    _id?: string;
    schemaKey: string;
    version: string;
    active: boolean;
    fieldConfig: {
        fields: Array<{
            field_name: string;
            label: string;
            "ui.component"?: string;
            required?: boolean;
            datasourceRef?: string;
            options?: Array<{
                value: string;
                label?: string;
            }>;
        }>;
    };
    behaviour?: {
        autoPopulate?: Array<{
            trigger: string;
            datasourceKey: string;
            mapping: Array<{
                sourceField: string;
                targetField: string;
            }>;
        }>;
    };
}
export declare function listSchemas(db: Db): Promise<Array<{
    schemaKey: string;
    version: string;
}>>;
export declare function getSchema(db: Db, schemaKey: string): Promise<SchemaDocument | null>;
//# sourceMappingURL=schemaService.d.ts.map