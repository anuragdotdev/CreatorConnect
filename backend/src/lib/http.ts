import type { Response } from "express";

/** Success envelope used by every endpoint. */
export function sendSuccess<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}
