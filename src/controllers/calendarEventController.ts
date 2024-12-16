import { endOfWeek, startOfWeek } from "date-fns";
import { Request, Response } from "express";
import { CalendarEvent, ICalendarEvent } from "../models/CalendarEvent.js";
import { ICourse } from "../models/Course.js";
import { Group, IGroup } from "../models/Group.js";
import { ILocation, Location } from "../models/Location.js";
import { ISchedule, Schedule } from "../models/Schedule.js";
import { ITeacher, Teacher } from "../models/Teacher.js";
import { CalendarEventType, Entity } from "../types.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateEventBody = {
  start: string;
  end: string;
  duration: number;
  type?: "LUNCH";
  course?: string;
  locations: string[];
  teachers: string[];
  groups: string[];
  color: string;
  belongsTo: string;
};

type CreateEventResponse = {
  week: string;
  teacher: Entity;
  group: Entity;
  location: Entity;
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
  req: Request<{}, CreateEventResponse, CreateEventBody, {}>,
  res: Response,
) {
  const {
    start,
    end,
    duration,
    type,
    course,
    locations,
    teachers,
    groups,
    color,
    belongsTo,
  } = req.body;

  const findSchedule = await Schedule.findById(belongsTo);

  if (!findSchedule) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid schedule.");
  }

  if (type && type !== "LUNCH") {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid type.");
  }

  if (duration < 0) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid duration.");
  }

  if (!locations.length || !teachers.length || !groups.length) {
    throw new ErrorResponse(
      ErrorCode.BAD_REQUEST,
      "Invalid locations, teachers or groups",
    );
  }

  if (!start || !end || !duration) {
    throw new ErrorResponse(
      ErrorCode.BAD_REQUEST,
      "Invalid start, end or duration",
    );
  }

  try {
    const result = await CalendarEvent.create({
      start,
      end,
      duration,
      type,
      course,
      locations,
      teachers,
      groups,
      color: color || "#818cf8",
      belongsTo,
    });
    if (!result) {
      throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
    }

    const startDate = new Date(start);
    const weekStartDate = startOfWeek(startDate, {
      weekStartsOn: 1,
    }).toLocaleDateString("en-CA");

    const [teacher, group, location] = await Promise.all([
      Teacher.findById(teachers[0]),
      Group.findById(groups[0]),
      Location.findById(locations[0]),
    ]);

    if (!teacher || !group || !location) {
      throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
    }

    const response: CreateEventResponse = {
      teacher: { id: teacher._id.toString(), displayName: teacher.displayName },
      group: { id: group._id.toString(), displayName: group.displayName },
      location: {
        id: location._id.toString(),
        displayName: location.displayName,
      },
      week: weekStartDate,
    };

    return sendValidResponse<CreateEventResponse>(
      res,
      SuccessCode.CREATED,
      response,
    );
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
  const { start, end, duration, type, course, locations, teachers, groups } =
    req.body;

  const findEvent = await CalendarEvent.findById(id);

  if (!findEvent) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid event.");
  }

  if (type && type !== "LUNCH") {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid type.");
  }

  if (duration && duration < 0) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid duration.");
  }

  try {
    await CalendarEvent.findByIdAndUpdate(id, {
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
