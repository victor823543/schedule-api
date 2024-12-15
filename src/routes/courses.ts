import express from "express";
import courseController from "../controllers/courseController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(courseController.getCourses));
router.delete("/", asyncHandler(courseController.deleteCourse));
router.delete("/delete-many", asyncHandler(courseController.deleteCourses));
router.post("/", asyncHandler(courseController.createCourse));

export default router;
