import express from "express";
import scheduleController from "../controllers/scheduleController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(scheduleController.getSchedules));
router.get("/:id", asyncHandler(scheduleController.getSchedule));
router.delete("/", asyncHandler(scheduleController.deleteSchedule));
router.post("/", asyncHandler(scheduleController.createSchedule));

export default router;
