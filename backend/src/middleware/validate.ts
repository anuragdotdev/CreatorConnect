import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { ApiError } from "../lib/api-error.js";

export interface FieldIssue {
  field: string;
  message: string;
}

function toFieldIssues(error: ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "_root",
    message: issue.message,
  }));
}

/**
 * Validates and replaces `req.body` with the parsed (and coerced) value.
 * Throws an ApiError with per-field messages when validation fails.
 */
export function validateBody<T extends ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = toFieldIssues(result.error);
      next(
        ApiError.validation("Request validation failed", {
          fields: issues,
        }),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Validates and replaces `req.query` with the parsed query parameters. */
export function validateQuery<T extends ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = toFieldIssues(result.error);
      next(
        ApiError.validation("Query parameter validation failed", {
          fields: issues,
        }),
      );
      return;
    }
    req.query = result.data as Request["query"];
    next();
  };
}
