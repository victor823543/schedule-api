import express from "express";
import entityController from "../controllers/entityController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(entityController.getEntities));
router.delete("/", asyncHandler(entityController.deleteEntity));
router.post("/", asyncHandler(entityController.createEntity));

export default router;
