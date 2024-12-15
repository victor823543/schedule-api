import express from "express";
import calendarEventController from "../controllers/calendarEventController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get(
  "/schedules/:schedule/calendar_events",
  asyncHandler(calendarEventController.getEvents),
);
router.delete(
  "/calendar_events",
  asyncHandler(calendarEventController.deleteEvent),
);
router.post(
  "/calendar_events",
  asyncHandler(calendarEventController.createEvent),
);
router.put(
  "/calendar_events",
  asyncHandler(calendarEventController.updateEvent),
);

export default router;
