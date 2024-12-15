import { Request, Response } from "express";
import { Schedule } from "../models/Schedule.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateScheduleBody = {
  displayName: string;
};

async function createSchedule(
  req: Request<{}, { id: string }, CreateScheduleBody, {}>,
  res: Response,
) {
  const { displayName } = req.body;
  let result;
  try {
    result = await Schedule.create({ displayName });
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

export default { createSchedule, getSchedules, deleteSchedule };
