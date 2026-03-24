import { connectDb, closeDb, getDb } from "../config/db.js";
import { loadEnv } from "../config/env.js";
import { createSchemaRepository } from "../repositories/schemaRepository.js";
import { createMoLookupRepository } from "../repositories/moLookupRepository.js";
import type { SchemaDocument } from "../types/schema.js";
import type { MoLookupDocument } from "../types/moLookup.js";

async function seed() {
  loadEnv();
  await connectDb();
  const db = getDb();

  const schemaRepo = createSchemaRepository(db);
  const moLookupRepo = createMoLookupRepository(db);

  const holdEntrySchema: SchemaDocument = {
    schemaKey: "hold_entry:add:v1",
    version: "v1",
    active: true,
    fieldConfig: {
      fields: [
        {
          field_name: "moBatchId",
          label: "MO # / BATCH #",
          "ui.component": "select",
          required: true,
          datasourceRef: "mo_lookup",
          search: { searchable: true, searchFormat: "partial", limitation: ["Search mo_lookup for MO/Batch values"] },
        },
        {
          field_name: "skuNumber",
          label: "SKU Number",
          "ui.component": "text",
          required: false,
          search: { searchable: true, searchFormat: "partial", limitation: { maxLength: 50 } },
        },
        {
          field_name: "skuDescription",
          label: "SKU Description",
          "ui.component": "text",
          required: false,
          search: { searchable: true, searchFormat: "partial", limitation: { maxLength: 200 } },
        },
        {
          field_name: "plantCode",
          label: "Plant",
          "ui.component": "select",
          required: true,
          options: [
            { value: "PLT01", label: "Plant 01" },
            { value: "PLT02", label: "Plant 02" },
            { value: "PLT03", label: "Plant 03" },
          ],
          search: { searchable: true, searchFormat: "exact", limitation: ["PLT01", "PLT02", "PLT03"] },
        },
        {
          field_name: "prodDate",
          label: "Production Date",
          "ui.component": "date",
          required: true,
          search: { searchable: true, searchFormat: "exact", limitation: ["mm/dd/yyyy"] },
        },
        {
          field_name: "category",
          label: "Category",
          "ui.component": "select",
          required: true,
          options: [
            { value: "Product Safety RedFlag", label: "Product Safety RedFlag" },
            { value: "Product Quality RedFlag", label: "Product Quality RedFlag" },
            { value: "Testing", label: "Testing" },
            { value: "Trials", label: "Trials" },
            { value: "Documentation", label: "Documentation" },
            { value: "Inventory Management", label: "Inventory Management" },
            { value: "Return Hold", label: "Return Hold" },
          ],
          search: {
            searchable: true,
            searchFormat: "exact",
            limitation: [
              "Product Safety RedFlag",
              "Product Quality RedFlag",
              "Testing",
              "Trials",
              "Documentation",
              "Inventory Management",
              "Return Hold",
            ],
          },
        },
        {
          field_name: "subCategory",
          label: "Sub-Category",
          "ui.component": "select",
          required: true,
          options: [
            { value: "Appearance", label: "Appearance" },
            { value: "Taste/Aroma", label: "Taste/Aroma" },
            { value: "Metrics", label: "Metrics" },
            { value: "Incoming Supply Quality", label: "Incoming Supply Quality" },
          ],
          search: {
            searchable: true,
            searchFormat: "exact",
            limitation: ["Appearance", "Taste/Aroma", "Metrics", "Incoming Supply Quality"],
          },
        },
        {
          field_name: "observation",
          label: "Observation",
          "ui.component": "select",
          required: true,
          options: [
            { value: "Topping", label: "Topping" },
            { value: "Texture", label: "Texture" },
            { value: "Shape", label: "Shape" },
            { value: "Packaging Orientation", label: "Packaging Orientation" },
            { value: "Other Quality", label: "Other Quality" },
            { value: "Damaged", label: "Damaged" },
            { value: "Color", label: "Color" },
          ],
          search: {
            searchable: true,
            searchFormat: "exact",
            limitation: [
              "Topping",
              "Texture",
              "Shape",
              "Packaging Orientation",
              "Other Quality",
              "Damaged",
              "Color",
            ],
          },
        },
        {
          field_name: "qtyOnHoldCs",
          label: "Qty on Hold (CS)",
          "ui.component": "number",
          required: false,
          search: { searchable: true, searchFormat: "exact", limitation: { min: 0, max: 999999 } },
        },
        {
          field_name: "plantRelated",
          label: "Plant Related",
          "ui.component": "select",
          required: false,
          options: [
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ],
          search: { searchable: true, searchFormat: "exact", limitation: ["Yes", "No"] },
        },
        {
          field_name: "location",
          label: "Location",
          "ui.component": "select",
          required: false,
          options: [
            { value: "LOC1", label: "LOC1" },
            { value: "CRE1", label: "CRE1" },
            { value: "CON1", label: "CON1" },
            { value: "CON2", label: "CON2" },
            { value: "CON4", label: "CON4" },
            { value: "LIN3", label: "LIN3" },
            { value: "NEW2", label: "NEW2" },
          ],
          search: {
            searchable: true,
            searchFormat: "exact",
            limitation: ["LOC1", "CRE1", "CON1", "CON2", "CON4", "LIN3", "NEW2"],
          },
        },
        {
          field_name: "lpsHus",
          label: "LPs / HUs",
          "ui.component": "textarea",
          required: false,
          search: { searchable: true, searchFormat: "partial", limitation: { maxLength: 500 } },
        },
        {
          field_name: "additionalNotes",
          label: "Additional Notes",
          "ui.component": "textarea",
          required: false,
          search: { searchable: true, searchFormat: "partial", limitation: { maxLength: 1000 } },
        },
        {
          field_name: "status",
          label: "Status",
          "ui.component": "select",
          required: false,
          options: [
            { value: "Disposition Due", label: "Disposition Due" },
            { value: "Disposition in Progress", label: "Disposition in Progress" },
            { value: "Disposition Provided", label: "Disposition Provided" },
            { value: "Disposition Completed", label: "Disposition Completed" },
            { value: "Closed", label: "Closed" },
          ],
          search: {
            searchable: true,
            searchFormat: "exact",
            limitation: [
              "Disposition Due",
              "Disposition in Progress",
              "Disposition Provided",
              "Disposition Completed",
              "Closed",
            ],
          },
        },
        {
          field_name: "dispositionProvider",
          label: "Disposition Provider",
          "ui.component": "select",
          required: false,
          options: [
            { value: "QA", label: "QA" },
            { value: "PROD", label: "PROD" },
            { value: "PLM", label: "PLM" },
            { value: "R&D", label: "R&D" },
            { value: "MM", label: "MM" },
          ],
          search: { searchable: true, searchFormat: "exact", limitation: ["QA", "PROD", "PLM", "R&D", "MM"] },
        },
        {
          field_name: "disposition",
          label: "Disposition",
          "ui.component": "select",
          required: false,
          options: [
            { value: "N/A", label: "N/A" },
            { value: "Disposition Due", label: "Disposition Due" },
            { value: "Approved & Release", label: "Approved & Release" },
            { value: "Rejected & Dispose", label: "Rejected & Dispose" },
            { value: "Rework & Release", label: "Rework & Release" },
          ],
          search: {
            searchable: true,
            searchFormat: "exact",
            limitation: ["N/A", "Disposition Due", "Approved & Release", "Rejected & Dispose", "Rework & Release"],
          },
        },
        {
          field_name: "dispositionProvidedTargetDate",
          label: "Disposition Provided Target Date",
          "ui.component": "date",
          required: false,
          search: { searchable: true, searchFormat: "exact", limitation: ["mm/dd/yyyy"] },
        },
        {
          field_name: "dispositionActor",
          label: "Disposition Actor",
          "ui.component": "select",
          required: false,
          options: [
            { value: "QA", label: "QA" },
            { value: "PROD", label: "PROD" },
            { value: "PLM", label: "PLM" },
            { value: "R&D", label: "R&D" },
            { value: "MM", label: "MM" },
          ],
          search: { searchable: true, searchFormat: "exact", limitation: ["QA", "PROD", "PLM", "R&D", "MM"] },
        },
        {
          field_name: "dispositionActionTargetDate",
          label: "Disposition Action Target Date",
          "ui.component": "date",
          required: false,
          search: { searchable: true, searchFormat: "exact", limitation: ["mm/dd/yyyy"] },
        },
      ],
    },
    behaviour: {
      autoPopulate: [
        {
          trigger: "moBatchId",
          datasourceKey: "mo_lookup",
          lookupBy: "id",
          mapping: [
            { sourceField: "skuNumber", targetField: "skuNumber" },
            { sourceField: "skuDescription", targetField: "skuDescription" },
            { sourceField: "plantCode", targetField: "plantCode" },
          ],
        },
      ],
    },
  };

  await schemaRepo.upsert(holdEntrySchema);
  console.log("Seeded schema: hold_entry:add:v1");

  const sampleMoLookup: MoLookupDocument[] = [
    { moBatchId: "MO-001", skuNumber: "SKU-1001", skuDescription: "Widget A", plantCode: "PLT01", prodDate: "2025-03-01", batchNumber: "B001" },
    { moBatchId: "MO-002", skuNumber: "SKU-1002", skuDescription: "Widget B", plantCode: "PLT01", prodDate: "2025-03-02", batchNumber: "B002" },
    { moBatchId: "MO-003", skuNumber: "SKU-1003", skuDescription: "Widget C", plantCode: "PLT02", prodDate: "2025-03-03", batchNumber: "B003" },
    { moBatchId: "MO-004", skuNumber: "SKU-1004", skuDescription: "Gadget X", plantCode: "PLT01", prodDate: "2025-03-04", batchNumber: "B004" },
    { moBatchId: "MO-005", skuNumber: "SKU-1005", skuDescription: "Gadget Y", plantCode: "PLT02", prodDate: "2025-03-05", batchNumber: "B005" },
    { moBatchId: "MO-006", skuNumber: "SKU-1006", skuDescription: "Gadget Z", plantCode: "PLT03", prodDate: "2025-03-06", batchNumber: "B006" },
    { moBatchId: "MO-007", skuNumber: "SKU-1007", skuDescription: "Part Alpha", plantCode: "PLT01", prodDate: "2025-03-07", batchNumber: "B007" },
    { moBatchId: "MO-008", skuNumber: "SKU-1008", skuDescription: "Part Beta", plantCode: "PLT02", prodDate: "2025-03-08", batchNumber: "B008" },
    { moBatchId: "MO-009", skuNumber: "SKU-1009", skuDescription: "Part Gamma", plantCode: "PLT03", prodDate: "2025-03-09", batchNumber: "B009" },
    { moBatchId: "MO-010", skuNumber: "SKU-1010", skuDescription: "Assembly Final", plantCode: "PLT01", prodDate: "2025-03-10", batchNumber: "B010" },
  ];

  const existing = await db.collection("mo_lookup").countDocuments();
  if (existing === 0) {
    await moLookupRepo.insertMany(sampleMoLookup);
    console.log(`Seeded ${sampleMoLookup.length} mo_lookup rows`);
  } else {
    console.log(`mo_lookup already has ${existing} documents, skipping`);
  }

  await closeDb();
  console.log("Seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
