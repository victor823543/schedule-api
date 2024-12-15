import { Request, Response } from "express";
import { Course } from "../models/Course.js";
import { CourseType } from "../types.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateCourseBody = {
  displayName: string;
  subject: string;
};

type GetCoursesQuery = {};

type DeleteCourseQuery = {
  id: string;
};

async function createCourse(
  req: Request<{}, { id: string }, CreateCourseBody, {}>,
  res: Response,
) {
  const { displayName, subject } = req.body;
  let result;
  try {
    result = await Course.create({ displayName, subject });
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
