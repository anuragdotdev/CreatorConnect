import { Router } from "express";
import { sendSuccess } from "../lib/http.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    service: "creatorconnect-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
