"use client";

import React, { useState, useCallback, useEffect } from "react";

interface SelectOption {
  value: string;
  label?: string;
}

interface FieldConfig {
  field_name: string;
  label: string;
  "ui.component": string;
  required?: boolean;
  options?: SelectOption[];
  datasourceRef?: string;
}

interface Schema {
  schemaKey: string;
  fieldConfig: { fields: FieldConfig[] };
}

interface SchemaFormProps {
  schemaKey: string;
  schema: Schema;
  fieldOptions?: Record<string, string | Record<string, string>>;
  initialValues?: Record<string, unknown>;
  /** Fires whenever any field changes (for Copilot / shared context). */
  onValuesChange?: (values: Record<string, unknown>) => void;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function SchemaForm({
  schema,
  fieldOptions = {},
  initialValues = {},
  onValuesChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SchemaFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = schema?.fieldConfig?.fields ?? [];

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  const handleChange = useCallback(
    (fieldName: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    },
    []
  );

  const validate = useCallback(() => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      if (field.required) {
        const v = values[field.field_name];
        if (v === undefined || v === null || v === "") {
          next[field.field_name] = `${field.label} is required`;
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [fields, values]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      onSubmit(values);
    },
    [validate, onSubmit, values]
  );

  const renderField = (field: FieldConfig) => {
    const value = values[field.field_name] ?? "";
    const error = errors[field.field_name];
    const options = field.options ?? [];
    const optsFromOptions = fieldOptions[field.field_name];
    const optionList =
      options.length > 0
        ? options
        : typeof optsFromOptions === "string"
          ? optsFromOptions.split(", ").map((o) => ({ value: o.trim(), label: o.trim() }))
          : [];

    if (field.datasourceRef) {
      return (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => handleChange(field.field_name, e.target.value)}
          className="form-input"
          placeholder={`Search ${field.label} (e.g. MO-001)`}
          required={field.required}
        />
      );
    }

    switch (field["ui.component"]) {
      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => handleChange(field.field_name, e.target.value)}
            className="form-select"
            required={field.required}
          >
            <option value="">Select...</option>
            {optionList.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label ?? opt.value}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={value === "" ? "" : Number(value)}
            onChange={(e) =>
              handleChange(
                field.field_name,
                e.target.value === "" ? "" : parseFloat(e.target.value)
              )
            }
            className="form-input"
            required={field.required}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={String(value)}
            onChange={(e) => handleChange(field.field_name, e.target.value)}
            className="form-input"
            required={field.required}
          />
        );
      case "textarea":
        return (
          <textarea
            value={String(value)}
            onChange={(e) => handleChange(field.field_name, e.target.value)}
            className="form-input"
            rows={3}
            required={field.required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={String(value)}
            onChange={(e) => handleChange(field.field_name, e.target.value)}
            className="form-input"
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="schema-form">
      <div className="schema-form-fields">
        {fields.map((field) => (
          <div key={field.field_name} className="schema-form-field">
            <label>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {renderField(field)}
            {errors[field.field_name] && (
              <span className="field-error">{errors[field.field_name]}</span>
            )}
          </div>
        ))}
      </div>
      <div className="schema-form-actions">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
