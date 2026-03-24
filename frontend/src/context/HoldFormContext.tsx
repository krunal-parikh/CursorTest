"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Schema, FieldConfig } from "@/types/schema";

type RespondFn = (payload: string) => void | Promise<void>;

export interface FieldChangeEvent {
  fieldName: string;
  value: unknown;
  label: string;
  timestamp: number;
}

export type HoldFormContextValue = {
  active: boolean;
  schemaKey: string | null;
  schema: Schema | null;
  fieldOptions: Record<string, unknown>;
  draftValues: Record<string, unknown>;
  errors: Record<string, string>;
  lastSubmissionJson: string | null;
  lastChangedField: FieldChangeEvent | null;
  formInstanceKey: number;
  respondRef: React.MutableRefObject<RespondFn | null>;

  openForm: (opts: {
    schemaKey: string;
    schema: Schema;
    fieldOptions?: Record<string, unknown>;
    respond?: RespondFn;
  }) => void;

  /** Update a single field — both form UI and chatbot can call this */
  updateField: (fieldName: string, value: unknown) => void;
  /** Bulk-set multiple fields at once (e.g. from auto-populate or chatbot) */
  setFieldValues: (values: Record<string, unknown>) => void;
  setDraftValues: (values: Record<string, unknown>) => void;
  setErrors: (errors: Record<string, string>) => void;
  setLastSubmission: (json: string | null) => void;

  /** Get the FieldConfig for a given field name */
  getFieldConfig: (fieldName: string) => FieldConfig | undefined;
  /** Get the next unfilled required field */
  getNextRequiredField: () => FieldConfig | undefined;
  /** Get completion status */
  getCompletionStatus: () => {
    total: number;
    filled: number;
    required: number;
    requiredFilled: number;
    nextRequired: FieldConfig | undefined;
  };
};

const HoldFormContext = createContext<HoldFormContextValue | null>(null);

export function HoldFormProvider({ children }: { children: React.ReactNode }) {
  const respondRef = useRef<RespondFn | null>(null);
  const [active, setActive] = useState(false);
  const [schemaKey, setSchemaKey] = useState<string | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [fieldOptions, setFieldOptions] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValuesState] = useState<Record<string, unknown>>({});
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [lastSubmissionJson, setLastSubmissionJson] = useState<string | null>(null);
  const [lastChangedField, setLastChangedField] = useState<FieldChangeEvent | null>(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);

  const openForm = useCallback(
    (opts: {
      schemaKey: string;
      schema: Schema;
      fieldOptions?: Record<string, unknown>;
      respond?: RespondFn;
    }) => {
      respondRef.current = opts.respond ?? null;
      setSchemaKey(opts.schemaKey);
      setSchema(opts.schema);
      setFieldOptions(opts.fieldOptions ?? {});
      setDraftValuesState({});
      setErrorsState({});
      setLastSubmissionJson(null);
      setLastChangedField(null);
      setFormInstanceKey((k) => k + 1);
      setActive(true);
    },
    []
  );

  const updateField = useCallback(
    (fieldName: string, value: unknown) => {
      setDraftValuesState((prev) => ({ ...prev, [fieldName]: value }));
      setErrorsState((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      const field = schema?.fieldConfig?.fields?.find(
        (f) => f.field_name === fieldName
      );
      setLastChangedField({
        fieldName,
        value,
        label: field?.label ?? fieldName,
        timestamp: Date.now(),
      });
    },
    [schema]
  );

  const setFieldValues = useCallback(
    (values: Record<string, unknown>) => {
      setDraftValuesState((prev) => ({ ...prev, ...values }));
      setErrorsState((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(values)) {
          delete next[key];
        }
        return next;
      });
    },
    []
  );

  const setDraftValues = useCallback((values: Record<string, unknown>) => {
    setDraftValuesState(values);
  }, []);

  const setErrors = useCallback((errs: Record<string, string>) => {
    setErrorsState(errs);
  }, []);

  const setLastSubmission = useCallback((json: string | null) => {
    setLastSubmissionJson(json);
  }, []);

  const getFieldConfig = useCallback(
    (fieldName: string) =>
      schema?.fieldConfig?.fields?.find((f) => f.field_name === fieldName),
    [schema]
  );

  const getNextRequiredField = useCallback(() => {
    const fields = schema?.fieldConfig?.fields ?? [];
    return fields.find((f) => {
      if (!f.required) return false;
      const v = draftValues[f.field_name];
      return v === undefined || v === null || v === "";
    });
  }, [schema, draftValues]);

  const getCompletionStatus = useCallback(() => {
    const fields = schema?.fieldConfig?.fields ?? [];
    const requiredFields = fields.filter((f) => f.required);
    const filled = fields.filter((f) => {
      const v = draftValues[f.field_name];
      return v !== undefined && v !== null && v !== "";
    }).length;
    const requiredFilled = requiredFields.filter((f) => {
      const v = draftValues[f.field_name];
      return v !== undefined && v !== null && v !== "";
    }).length;
    return {
      total: fields.length,
      filled,
      required: requiredFields.length,
      requiredFilled,
      nextRequired: getNextRequiredField(),
    };
  }, [schema, draftValues, getNextRequiredField]);

  const value = useMemo(
    () => ({
      active,
      schemaKey,
      schema,
      fieldOptions,
      draftValues,
      errors,
      lastSubmissionJson,
      lastChangedField,
      formInstanceKey,
      respondRef,
      openForm,
      updateField,
      setFieldValues,
      setDraftValues,
      setErrors,
      setLastSubmission,
      getFieldConfig,
      getNextRequiredField,
      getCompletionStatus,
    }),
    [
      active,
      schemaKey,
      schema,
      fieldOptions,
      draftValues,
      errors,
      lastSubmissionJson,
      lastChangedField,
      formInstanceKey,
      respondRef,
      openForm,
      updateField,
      setFieldValues,
      setDraftValues,
      setErrors,
      setLastSubmission,
      getFieldConfig,
      getNextRequiredField,
      getCompletionStatus,
    ]
  );

  return (
    <HoldFormContext.Provider value={value}>{children}</HoldFormContext.Provider>
  );
}

export function useHoldForm(): HoldFormContextValue {
  const ctx = useContext(HoldFormContext);
  if (!ctx) {
    throw new Error("useHoldForm must be used within HoldFormProvider");
  }
  return ctx;
}
