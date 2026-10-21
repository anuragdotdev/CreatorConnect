import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error.js";

/** Centralized error handler producing the shared error envelope. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      res.status(409).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: target
            ? `A profile with this ${target.replace(/email/gi, "email")} already exists`
            : "A profile with these details already exists",
        },
      });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Profile not found" },
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Invalid data supplied to the database" },
    });
    return;
  }

  // Malformed JSON body
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Request body must be valid JSON" },
    });
    return;
  }

  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
  });
}
