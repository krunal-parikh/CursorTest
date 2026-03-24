"use client";

import React, { useCallback, useEffect, useRef } from "react";
import type { FieldConfig, Schema, DatasourceItem, AutoPopulateRule } from "@/types/schema";
import { DatasourceField } from "@/components/DatasourceField";

interface SchemaFormProps {
  schema: Schema;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onFieldChange: (fieldName: string, value: unknown) => void;
  onAutoPopulate: (values: Record<string, unknown>) => void;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function SchemaForm({
  schema,
  values,
  errors,
  onFieldChange,
  onAutoPopulate,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SchemaFormProps) {
  const fields = schema?.fieldConfig?.fields ?? [];
  const autoPopulateRules = schema?.behaviour?.autoPopulate ?? [];
  const prevTriggerValues = useRef<Record<string, unknown>>({});

  useEffect(() => {
    for (const rule of autoPopulateRules) {
      const triggerVal = values[rule.trigger];
      const prevVal = prevTriggerValues.current[rule.trigger];
      if (triggerVal && triggerVal !== prevVal && triggerVal !== "") {
        prevTriggerValues.current[rule.trigger] = triggerVal;
        resolveAutoPopulate(rule, String(triggerVal));
      }
    }
  }, [values, autoPopulateRules]);

  async function resolveAutoPopulate(rule: AutoPopulateRule, lookupId: string) {
    try {
      const res = await fetch(
        `/api/mcp-rest/datasources/${rule.datasourceKey}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lookupId }),
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const items = data.items ?? [];
      if (items.length === 0) return;
      const item = items[0];
      const populated: Record<string, unknown> = {};
      for (const m of rule.mapping) {
        if (item[m.sourceField] !== undefined) {
          populated[m.targetField] = item[m.sourceField];
        }
      }
      if (Object.keys(populated).length > 0) {
        onAutoPopulate(populated);
      }
    } catch {
      // auto-populate is best-effort
    }
  }

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
    return next;
  }, [fields, values]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        // propagate errors up so context has them for the chatbot
        for (const [k, v] of Object.entries(errs)) {
          onFieldChange(k, values[k]); // keep value, just trigger re-render
        }
        return;
      }
      onSubmit(values);
    },
    [validate, onSubmit, values, onFieldChange]
  );

  const handleDatasourceSelect = useCallback(
    (fieldName: string, item: DatasourceItem) => {
      onFieldChange(fieldName, item.id);
      const rule = autoPopulateRules.find((r) => r.trigger === fieldName);
      if (rule) {
        const populated: Record<string, unknown> = {};
        for (const m of rule.mapping) {
          if (item[m.sourceField] !== undefined) {
            populated[m.targetField] = item[m.sourceField];
          }
        }
        if (Object.keys(populated).length > 0) {
          onAutoPopulate(populated);
        }
      }
    },
    [onFieldChange, autoPopulateRules, onAutoPopulate]
  );

  const renderField = (field: FieldConfig) => {
    const value = values[field.field_name] ?? "";
    const options = field.options ?? [];

    if (field.datasourceRef) {
      return (
        <DatasourceField
          fieldName={field.field_name}
          label={field.label}
          datasourceRef={field.datasourceRef}
          value={String(value)}
          required={field.required}
          onChange={(v) => onFieldChange(field.field_name, v)}
          onItemSelect={(item) => handleDatasourceSelect(field.field_name, item)}
        />
      );
    }

    switch (field["ui.component"]) {
      case "select":
        return (
          <select
            value={String(value)}
            onChange={(e) => onFieldChange(field.field_name, e.target.value)}
            className="form-select"
            required={field.required}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
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
              onFieldChange(
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
            onChange={(e) => onFieldChange(field.field_name, e.target.value)}
            className="form-input"
            required={field.required}
          />
        );
      case "textarea":
        return (
          <textarea
            value={String(value)}
            onChange={(e) => onFieldChange(field.field_name, e.target.value)}
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
            onChange={(e) => onFieldChange(field.field_name, e.target.value)}
            className="form-input"
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="schema-form">
      <div className="schema-form-fields">
        {fields.map((field) => {
          const value = values[field.field_name];
          const isFilled = value !== undefined && value !== null && value !== "";
          return (
            <div
              key={field.field_name}
              className={`schema-form-field ${isFilled ? "field-filled" : ""}`}
            >
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
                {isFilled && <span className="field-check">&#10003;</span>}
              </label>
              {renderField(field)}
              {errors[field.field_name] && (
                <span className="field-error">{errors[field.field_name]}</span>
              )}
            </div>
          );
        })}
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
