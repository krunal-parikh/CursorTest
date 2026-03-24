import type { Request, Response, NextFunction } from "express";
import { createHoldEntryService } from "../services/holdEntryService.js";
import { getDb } from "../config/db.js";

export async function previewHoldEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDb();
    const holdService = createHoldEntryService(db);
    const { schemaKey, data } = req.body as {
      schemaKey?: string;
      data?: Record<string, unknown>;
    };
    const payload = data ?? (req.body as Record<string, unknown>);
    const schemaKeyToUse = schemaKey ?? "hold_entry:add:v1";

    const result = await holdService.previewHoldEntry(schemaKeyToUse, payload);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createHoldEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDb();
    const holdService = createHoldEntryService(db);
    const { schemaKey, data } = req.body as { schemaKey: string; data: Record<string, unknown> };
    const payload = data ?? req.body;
    const schemaKeyToUse = schemaKey ?? "hold_entry:add:v1";

    const entry = await holdService.createHoldEntry(
      schemaKeyToUse,
      payload,
      req.requestId
    );

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getHoldEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const holdId = req.params.holdId;
    if (!holdId) {
      res.status(400).json({ error: "Hold ID is required" });
      return;
    }
    const db = getDb();
    const holdService = createHoldEntryService(db);
    const entry = await holdService.getHoldEntry(holdId);
    if (!entry) {
      res.status(404).json({ error: "Hold entry not found", holdId });
      return;
    }
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

export async function listHoldEntries(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDb();
    const holdService = createHoldEntryService(db);
    const { limit, page, ...query } = req.query;
    const limitNum = Math.min(parseInt(String(limit ?? 20), 10) || 20, 100);
    const pageNum = Math.max(1, parseInt(String(page ?? 1), 10) || 1);

    const filter: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== "") {
        filter[key] = typeof value === "string" ? value : value;
      }
    }

    const result = await holdService.listHoldEntries(filter, limitNum, pageNum);

    res.json(result);
  } catch (err) {
    next(err);
  }
}
