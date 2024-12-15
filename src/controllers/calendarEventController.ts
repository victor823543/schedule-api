import { endOfWeek } from "date-fns";
import { Request, Response } from "express";
import { CalendarEvent, ICalendarEvent } from "../models/CalendarEvent.js";
import { ICourse } from "../models/Course.js";
import { IGroup } from "../models/Group.js";
import { ILocation } from "../models/Location.js";
import { ISchedule, Schedule } from "../models/Schedule.js";
import { ITeacher } from "../models/Teacher.js";
import { CalendarEventType } from "../types.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateEventBody = {
  displayName: string;
  start: string;
  end: string;
  duration: number;
  type?: "LUNCH";
  course?: string;
  locations: string[];
  teachers: string[];
  groups: string[];
};

type PopulatedCalendarEvent = Omit<
  ICalendarEvent,
  "locations" | "teachers" | "groups"
> & {
  belongsTo: ISchedule;
  course?: ICourse;
  teachers: ITeacher[];
  groups: IGroup[];
  locations: ILocation[];
};

async function createEvent(
  req: Request<{}, { id: string }, CreateEventBody, {}>,
  res: Response,
) {
  const {
    displayName,
    start,
    end,
    duration,
    type,
    course,
    locations,
    teachers,
    groups,
  } = req.body;

  if (type && type !== "LUNCH") {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid type.");
  }

  if (duration < 0) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid duration.");
  }

  try {
    const result = await CalendarEvent.create({
      displayName,
      start,
      end,
      duration,
      type,
      course,
      locations,
      teachers,
      groups,
    });
    if (!result) {
      throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
    }
    return sendValidResponse<{ id: string }>(res, SuccessCode.CREATED, {
      id: result._id.toString(),
    });
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

type GetEventsQuery = {
  week: string;
  inLocations?: string;
  teachers?: string;
  groups?: string;
};

async function getEvents(
  req: Request<
    { schedule: string },
    Array<CalendarEventType>,
    {},
    GetEventsQuery
  >,
  res: Response,
) {
  const { schedule } = req.params;
  const { week, inLocations, teachers, groups } = req.query;

  const findSchedule = await Schedule.findById(schedule);

  if (!findSchedule) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid schedule.");
  }

  if (!week || (!inLocations && !teachers && !groups)) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid query parameters.");
  }

  const startDate = new Date(week);
  const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

  try {
    const events = (await CalendarEvent.find({
      start: { $gte: startDate, $lt: endDate },
      ...(inLocations && { locations: inLocations }),
      ...(teachers && { teachers: teachers }),
      ...(groups && { groups: groups }),
      belongsTo: findSchedule,
    })
      .populate("locations teachers groups course belongsTo")
      .lean()) as unknown as PopulatedCalendarEvent[];

    const eventList: CalendarEventType[] = events.map((e) => ({
      id: e._id.toString(),
      belongsTo: {
        id: e.belongsTo._id.toString(),
        displayName: e.belongsTo.displayName,
      },
      displayName: e.displayName,
      start: e.start,
      end: e.end,
      duration: e.duration,
      type: e.type,
      course: e.course
        ? {
            id: e.course._id.toString(),
            displayName: e.course.displayName,
            subject: e.course.subject,
          }
        : undefined,
      inLocations: e.locations.map((l) => ({
        id: l._id.toString(),
        displayName: l.displayName,
      })),
      teachers: e.teachers.map((t) => ({
        id: t._id.toString(),
        displayName: t.displayName,
      })),
      groups: e.groups.map((g) => ({
        id: g._id.toString(),
        displayName: g.displayName,
      })),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      color: e.color,
      cancelled: e.cancelled,
    }));
    sendValidResponse<CalendarEventType[]>(res, SuccessCode.OK, eventList);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

type DeleteEventQuery = {
  id: string;
};

async function deleteEvent(
  req: Request<{}, void, {}, DeleteEventQuery>,
  res: Response,
) {
  const { id } = req.query;

  try {
    await CalendarEvent.findByIdAndDelete(id);
    sendValidResponse(res, SuccessCode.NO_CONTENT);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

type UpdateEventBody = {
  displayName?: string;
  start?: string;
  end?: string;
  duration?: number;
  type?: "LUNCH";
  course?: string;
  locations?: string[];
  teachers?: string[];
  groups?: string[];
};

async function updateEvent(
  req: Request<{ id: string }, void, UpdateEventBody, {}>,
  res: Response,
) {
  const { id } = req.params;
  const {
    displayName,
    start,
    end,
    duration,
    type,
    course,
    locations,
    teachers,
    groups,
  } = req.body;

  if (type && type !== "LUNCH") {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid type.");
  }

  if (duration && duration < 0) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid duration.");
  }

  try {
    await CalendarEvent.findByIdAndUpdate(id, {
      ...(displayName && { displayName }),
      ...(start && { start }),
      ...(end && { end }),
      ...(duration && { duration }),
      ...(type && { type }),
      ...(course && { course }),
      ...(locations && { locations }),
      ...(teachers && { teachers }),
      ...(groups && { groups }),
    });
    sendValidResponse(res, SuccessCode.NO_CONTENT);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

export default { createEvent, getEvents, deleteEvent, updateEvent };
