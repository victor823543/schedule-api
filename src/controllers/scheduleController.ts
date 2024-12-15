import { Request, Response } from "express";
import { ICourse } from "../models/Course.js";
import { IGroup } from "../models/Group.js";
import { ILocation } from "../models/Location.js";
import { ISchedule, Schedule } from "../models/Schedule.js";
import { ITeacher } from "../models/Teacher.js";
import { CourseType, Entity } from "../types.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateScheduleBody = {
  name: string;
};

type PopulatedSchedule = Omit<
  ISchedule,
  "locations" | "teachers" | "groups" | "courses"
> & {
  teachers: ITeacher[];
  groups: IGroup[];
  locations: ILocation[];
  courses: ICourse[];
};

type GetScheduleResponse = {
  id: string;
  displayName: string;
  teachers: Entity[];
  groups: Entity[];
  locations: Entity[];
  courses: CourseType[];
};

async function createSchedule(
  req: Request<{}, { id: string }, CreateScheduleBody, {}>,
  res: Response,
) {
  const { name } = req.body;
  let result;
  try {
    result = await Schedule.create({ displayName: name });
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }

  if (!result) {
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }

  return sendValidResponse<{ id: string }>(res, SuccessCode.CREATED, {
    id: result._id.toString(),
  });
}

async function getSchedules(
  req: Request<{}, Array<{ id: string; displayName: string }>, {}, {}>,
  res: Response,
) {
  try {
    const schedules = await Schedule.find();
    const scheduleList = schedules.map((s) => ({
      id: s._id.toString(),
      displayName: s.displayName,
    }));
    sendValidResponse(res, SuccessCode.OK, scheduleList);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

async function getSchedule(
  req: Request<{ id: string }, GetScheduleResponse, {}, {}>,
  res: Response,
) {
  const { id } = req.params;
  try {
    const schedule = (await Schedule.findById(id).populate(
      "teachers groups locations courses",
    )) as unknown as PopulatedSchedule;

    if (!schedule) {
      throw new ErrorResponse(ErrorCode.NO_RESULT, "Schedule not found.");
    }

    const response: GetScheduleResponse = {
      id: schedule._id.toString(),
      displayName: schedule.displayName,
      teachers: schedule.teachers.map((t) => ({
        id: t._id.toString(),
        displayName: t.displayName,
      })),
      groups: schedule.groups.map((g) => ({
        id: g._id.toString(),
        displayName: g.displayName,
      })),
      locations: schedule.locations.map((l) => ({
        id: l._id.toString(),
        displayName: l.displayName,
      })),
      courses: schedule.courses.map((c) => ({
        id: c._id.toString(),
        displayName: c.displayName,
        subject: c.subject,
      })),
    };

    sendValidResponse<GetScheduleResponse>(res, SuccessCode.OK, response);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

async function deleteSchedule(
  req: Request<{ id: string }, void, {}, {}>,
  res: Response,
) {
  const { id } = req.params;
  try {
    await Schedule.findByIdAndDelete(id);
    sendValidResponse(res, SuccessCode.NO_CONTENT);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

export default { createSchedule, getSchedules, deleteSchedule, getSchedule };
