import type { Db } from "mongodb";
import type { SchemaDocument } from "../types/schema.js";
import type { HoldEntryDocument, HoldStatus } from "../types/holdEntry.js";
import type { ResolveResultItem } from "../types/datasource.js";
import { resolveDatasource } from "./datasource/index.js";
import { createSchemaRepository } from "../repositories/schemaRepository.js";
import { createHoldEntryRepository } from "../repositories/holdEntryRepository.js";
import type { ListHoldEntriesFilter } from "../repositories/holdEntryRepository.js";
import { createCounterRepository } from "../repositories/counterRepository.js";
import { createAuditRepository } from "../repositories/auditRepository.js";
import { AppValidationError } from "../domain/appError.js";
import {
  assertValidHoldId,
  normalizeListParams,
  validateHoldEntryData,
} from "../domain/validateHoldEntryData.js";

const ALLOWED_COLLECTIONS = ["hold_entries"] as const;

export function createHoldEntryService(db: Db) {
  const schemaRepo = createSchemaRepository(db);
  const holdRepo = createHoldEntryRepository(db);
  const counterRepo = createCounterRepository(db);
  const auditRepo = createAuditRepository(db);

  return {
    async previewHoldEntry(
      schemaKey: string,
      data: Record<string, unknown>
    ): Promise<{ enriched: Record<string, unknown>; holdIdPreview: string }> {
      const schema = await schemaRepo.findByKey(schemaKey);
      if (!schema) throw new Error(`Schema not found: ${schemaKey}`);

      const enriched = await applyAutoPopulate(schema, data);
      validateHoldEntryData(schema, enriched);
      const plantCode = String(enriched.plantCode ?? "DEFAULT");
      const holdIdPreview = `${plantCode}-XXXXXX (generated on submit)`;

      return { enriched, holdIdPreview };
    },

    async createHoldEntry(
      schemaKey: string,
      data: Record<string, unknown>,
      requestId?: string
    ): Promise<HoldEntryDocument> {
      const schema = await schemaRepo.findByKey(schemaKey);
      if (!schema) throw new Error(`Schema not found: ${schemaKey}`);

      const enriched = await applyAutoPopulate(schema, data);
      validateHoldEntryData(schema, enriched);

      const plantCode = String(enriched.plantCode ?? "DEFAULT");
      const seq = await counterRepo.getNextSequence(`hold_${plantCode}`);
      const holdId = `${plantCode}-${String(seq).padStart(6, "0")}`;

      const now = new Date();
      const entry: HoldEntryDocument = {
        holdId,
        schemaKey,
        schemaVersion: schema.version,
        status: "Open" as HoldStatus,
        data: enriched,
        timestamps: { createdAt: now, updatedAt: now },
      };

      const insertedId = await holdRepo.insert(entry);
      await auditRepo.insert({
        action: "hold_entry.created",
        resourceType: "hold_entry",
        resourceId: insertedId,
        payload: { holdId, schemaKey },
        requestId,
        timestamp: now,
      });

      return { ...entry, _id: insertedId };
    },

    async createRecord(
      collection: string,
      payload: Record<string, unknown>,
      requestId?: string
    ): Promise<{ id: string; record: Record<string, unknown> }> {
      if (!ALLOWED_COLLECTIONS.includes(collection as (typeof ALLOWED_COLLECTIONS)[number])) {
        throw new AppValidationError(
          `Collection not allowed. Allowed: ${ALLOWED_COLLECTIONS.join(", ")}`,
          [{ path: "collection", message: `Must be one of: ${ALLOWED_COLLECTIONS.join(", ")}` }]
        );
      }

      if (collection === "hold_entries") {
        const schemaKey = String(payload.schemaKey ?? "hold_entry:add:v1");
        const { data: payloadData, ...rest } = payload;
        const data = (payloadData as Record<string, unknown>) ?? rest;
        const entry = await this.createHoldEntry(schemaKey, data, requestId);
        return {
          id: entry.holdId,
          record: {
            holdId: entry.holdId,
            schemaKey: entry.schemaKey,
            status: entry.status,
            data: entry.data,
            timestamps: entry.timestamps,
          },
        };
      }

      throw new AppValidationError(`Unsupported collection: ${collection}`, [
        { path: "collection", message: `Unsupported collection: ${collection}` },
      ]);
    },

    async getHoldEntry(holdId: string): Promise<HoldEntryDocument | null> {
      assertValidHoldId(holdId);
      return holdRepo.findByHoldId(holdId.trim());
    },

    async listHoldEntries(
      filter: ListHoldEntriesFilter,
      limit: number,
      page: number
    ): Promise<{ items: HoldEntryDocument[]; total: number; page: number; limit: number }> {
      const { limit: lim, page: pg } = normalizeListParams(limit, page);
      const skip = (pg - 1) * lim;
      const { items, total } = await holdRepo.list(filter, lim, skip);
      return { items, total, page: pg, limit: lim };
    },
  };
}

async function applyAutoPopulate(
  schema: SchemaDocument,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const rules = schema.behaviour?.autoPopulate ?? [];
  let result = { ...data };

  for (const rule of rules) {
    const triggerValue = result[rule.trigger];
    if (triggerValue == null || triggerValue === "") continue;

    const resolved = await resolveDatasource({
      datasourceKey: rule.datasourceKey,
      lookupId: String(triggerValue),
    });

    const item = resolved.items[0] as ResolveResultItem | undefined;
    if (!item) continue;

    for (const m of rule.mapping) {
      const val = item[m.sourceField];
      if (val !== undefined) {
        result = { ...result, [m.targetField]: val };
      }
    }
  }

  return result;
}
