import { describe, it, expect } from "vitest";
import { validateHoldEntryData } from "./validateHoldEntryData.js";
import type { SchemaDocument } from "../types/schema.js";
import { AppValidationError } from "./appError.js";

const minimalSchema: SchemaDocument = {
  schemaKey: "test",
  version: "v1",
  active: true,
  fieldConfig: {
    fields: [
      {
        field_name: "moBatchId",
        label: "MO",
        "ui.component": "text",
        required: true,
      },
      {
        field_name: "prodDate",
        label: "Date",
        "ui.component": "date",
        required: true,
      },
      {
        field_name: "category",
        label: "Category",
        "ui.component": "select",
        required: true,
        options: [{ value: "A" }, { value: "B" }],
      },
    ],
  },
};

describe("validateHoldEntryData", () => {
  it("passes when required fields are valid", () => {
    expect(() =>
      validateHoldEntryData(minimalSchema, {
        moBatchId: "MO-1",
        prodDate: "03/05/2025",
        category: "A",
      })
    ).not.toThrow();
  });

  it("throws AppValidationError when required field missing", () => {
    expect(() =>
      validateHoldEntryData(minimalSchema, {
        moBatchId: "MO-1",
        prodDate: "03/05/2025",
      })
    ).toThrow(AppValidationError);
  });

  it("throws when date format wrong", () => {
    expect(() =>
      validateHoldEntryData(minimalSchema, {
        moBatchId: "MO-1",
        prodDate: "2025-03-05",
        category: "A",
      })
    ).toThrow(AppValidationError);
  });

  it("throws when select value not allowed", () => {
    expect(() =>
      validateHoldEntryData(minimalSchema, {
        moBatchId: "MO-1",
        prodDate: "03/05/2025",
        category: "Invalid",
      })
    ).toThrow(AppValidationError);
  });
});
