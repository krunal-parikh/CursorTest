"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type HoldFormSchema = {
  schemaKey?: string;
  fieldConfig: { fields: Array<Record<string, unknown>> };
};

type RespondFn = (payload: string) => void | Promise<void>;

export type HoldFormContextValue = {
  active: boolean;
  schemaKey: string | null;
  schema: HoldFormSchema | null;
  fieldOptions: Record<string, unknown>;
  draftValues: Record<string, unknown>;
  lastSubmissionJson: string | null;
  /** Bumps when the assistant opens a new form (remount SchemaForm). */
  formInstanceKey: number;
  respondRef: React.MutableRefObject<RespondFn | null>;
  openForm: (opts: {
    schemaKey: string;
    schema: HoldFormSchema;
    fieldOptions?: Record<string, unknown>;
    respond: RespondFn;
  }) => void;
  setDraftValues: (values: Record<string, unknown>) => void;
  setLastSubmission: (json: string | null) => void;
};

const HoldFormContext = createContext<HoldFormContextValue | null>(null);

export function HoldFormProvider({ children }: { children: React.ReactNode }) {
  const respondRef = useRef<RespondFn | null>(null);
  const [active, setActive] = useState(false);
  const [schemaKey, setSchemaKey] = useState<string | null>(null);
  const [schema, setSchema] = useState<HoldFormSchema | null>(null);
  const [fieldOptions, setFieldOptions] = useState<Record<string, unknown>>({});
  const [draftValues, setDraftValuesState] = useState<Record<string, unknown>>({});
  const [lastSubmissionJson, setLastSubmissionJson] = useState<string | null>(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);

  const openForm = useCallback(
    (opts: {
      schemaKey: string;
      schema: HoldFormSchema;
      fieldOptions?: Record<string, unknown>;
      respond: RespondFn;
    }) => {
      respondRef.current = opts.respond;
      setSchemaKey(opts.schemaKey);
      setSchema(opts.schema);
      setFieldOptions(opts.fieldOptions ?? {});
      setDraftValuesState({});
      setLastSubmissionJson(null);
      setFormInstanceKey((k) => k + 1);
      setActive(true);
    },
    []
  );

  const setDraftValues = useCallback((values: Record<string, unknown>) => {
    setDraftValuesState(values);
  }, []);

  const setLastSubmission = useCallback((json: string | null) => {
    setLastSubmissionJson(json);
  }, []);

  const value = useMemo(
    () => ({
      active,
      schemaKey,
      schema,
      fieldOptions,
      draftValues,
      lastSubmissionJson,
      formInstanceKey,
      respondRef,
      openForm,
      setDraftValues,
      setLastSubmission,
    }),
    [
      active,
      schemaKey,
      schema,
      fieldOptions,
      draftValues,
      lastSubmissionJson,
      formInstanceKey,
      openForm,
      setDraftValues,
      setLastSubmission,
      respondRef,
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
