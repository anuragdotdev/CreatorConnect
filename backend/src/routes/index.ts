import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { profileRouter } from "./profile.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/profiles", profileRouter);
