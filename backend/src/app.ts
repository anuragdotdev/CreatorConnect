import cors from "cors";
import express, { type Express } from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRouter } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        service: "CreatorConnect API",
        docs: "/api/health",
        endpoints: [
          "GET /api/health",
          "GET /api/profiles",
          "GET /api/profiles/industries",
          "GET /api/profiles/:id",
          "POST /api/profiles",
          "PUT /api/profiles/:id",
          "DELETE /api/profiles/:id",
        ],
      },
    });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
