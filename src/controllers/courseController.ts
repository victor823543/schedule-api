import { Request, Response } from "express";
import { Course } from "../models/Course.js";
import { Schedule } from "../models/Schedule.js";
import { CourseType } from "../types.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateCourseBody = {
  displayName: string;
  subject: string;
  schedule: string;
};

type GetCoursesQuery = {};

type DeleteCourseQuery = {
  id: string;
};

async function createCourse(
  req: Request<{}, { id: string }, CreateCourseBody, {}>,
  res: Response,
) {
  const { displayName, subject, schedule } = req.body;
  let result;

  const findSchedule = await Schedule.findById(schedule);
  if (!findSchedule) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid schedule.");
  }

  try {
    result = await Course.create({ displayName, subject });
    findSchedule.courses.push(result._id);
    await findSchedule.save();
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

async function getCourses(
  req: Request<{}, Array<CourseType>, {}, GetCoursesQuery>,
  res: Response,
) {
  try {
    const courses = await Course.find();
    const courseList = courses.map((c) => ({
      id: c._id.toString(),
      displayName: c.displayName,
      subject: c.subject,
    }));
    sendValidResponse<CourseType[]>(res, SuccessCode.OK, courseList);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

async function deleteCourse(
  req: Request<{}, void, {}, DeleteCourseQuery>,
  res: Response,
) {
  const { id } = req.query;

  try {
    await Course.deleteOne({ _id: id });
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }

  return sendValidResponse(res, SuccessCode.NO_CONTENT);
}

export default { createCourse, getCourses, deleteCourse };
