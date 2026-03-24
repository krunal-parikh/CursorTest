export interface SelectOption {
  value: string;
  label?: string;
}

export interface SearchConfig {
  searchable?: boolean;
  searchFormat?: "partial" | "exact";
  limitation?: string[] | Record<string, unknown>;
}

export interface FieldConfig {
  field_name: string;
  label: string;
  "ui.component": "select" | "text" | "number" | "date" | "textarea";
  required?: boolean;
  options?: SelectOption[];
  datasourceRef?: string;
  search?: SearchConfig;
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

export interface Schema {
  schemaKey: string;
  fieldConfig: { fields: FieldConfig[] };
  behaviour?: {
    autoPopulate?: AutoPopulateRule[];
  };
}

export interface DatasourceItem {
  id: string;
  label: string;
  [key: string]: unknown;
}
