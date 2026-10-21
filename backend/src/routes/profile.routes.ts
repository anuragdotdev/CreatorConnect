import { Router } from "express";
import {
  createProfileController,
  deleteProfileController,
  getProfileController,
  listIndustriesController,
  listProfilesController,
  updateProfileController,
} from "../controllers/profile.controller.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createProfileSchema,
  listProfilesQuerySchema,
  updateProfileSchema,
} from "../schemas/profile.js";

export const profileRouter = Router();

profileRouter.get("/", validateQuery(listProfilesQuerySchema), listProfilesController);
profileRouter.get("/industries", listIndustriesController);
profileRouter.get("/:id", getProfileController);
profileRouter.post("/", validateBody(createProfileSchema), createProfileController);
profileRouter.put("/:id", validateBody(updateProfileSchema), updateProfileController);
profileRouter.delete("/:id", deleteProfileController);
