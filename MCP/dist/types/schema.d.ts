export type UIComponent = "text" | "number" | "select" | "date" | "textarea" | "hidden";
export interface ValidationRule {
    type: "required" | "minLength" | "maxLength" | "pattern" | "min" | "max";
    value?: string | number;
    message?: string;
}
export interface SelectOption {
    value: string;
    label?: string;
}
/** Search metadata to help AI construct valid search queries */
export interface SearchMeta {
    searchable?: boolean;
    /** exact = match value; partial = substring/regex */
    searchFormat?: "exact" | "partial";
    /** For select fields: allowed values. For number: min/max. For text: maxLength. */
    limitation?: string[] | {
        min?: number;
        max?: number;
        maxLength?: number;
    };
}
export interface FieldConfig {
    field_name: string;
    label: string;
    "ui.component": UIComponent;
    required?: boolean;
    validation?: ValidationRule[];
    datasourceRef?: string;
    options?: SelectOption[];
    search?: SearchMeta;
}
export interface AutoPopulateMapping {
    sourceField: string;
    targetField: string;
}
export interface AutoPopulateRule {
    trigger: string;
    datasourceKey: string;
    lookupBy: string;
    mapping: AutoPopulateMapping[];
}
export interface SchemaBehaviour {
    autoPopulate?: AutoPopulateRule[];
}
export interface SchemaDocument {
    _id?: string;
    schemaKey: string;
    version: string;
    active: boolean;
    fieldConfig: {
        fields: FieldConfig[];
    };
    behaviour?: SchemaBehaviour;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=schema.d.ts.map