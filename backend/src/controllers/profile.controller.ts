import type { Request, Response } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { sendSuccess } from "../lib/http.js";
import {
  createProfile,
  deleteProfile,
  getProfileById,
  listProfiles,
  listIndustries,
  updateProfile,
} from "../services/profile.service.js";
import type {
  CreateProfileInput,
  ListProfilesQuery,
  UpdateProfileInput,
} from "../schemas/profile.js";

export const listProfilesController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as ListProfilesQuery;
    const profiles = await listProfiles(query);
    sendSuccess(res, profiles, 200);
  },
);

export const listIndustriesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const industries = await listIndustries();
    sendSuccess(res, industries, 200);
  },
);

export const getProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await getProfileById(req.params.id);
    sendSuccess(res, profile, 200);
  },
);

export const createProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await createProfile(req.body as CreateProfileInput);
    sendSuccess(res, profile, 201);
  },
);

export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await updateProfile(
      req.params.id,
      req.body as UpdateProfileInput,
    );
    sendSuccess(res, profile, 200);
  },
);

export const deleteProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const profile = await deleteProfile(req.params.id);
    sendSuccess(res, { id: profile.id, deleted: true }, 200);
  },
);
