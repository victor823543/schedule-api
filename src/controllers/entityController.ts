import { Request, Response } from "express";
import { Group } from "../models/Group.js";
import { Location } from "../models/Location.js";
import { Schedule } from "../models/Schedule.js";
import { Teacher } from "../models/Teacher.js";
import { Entity, EntityCategory } from "../types.js";
import { ErrorCode, SuccessCode } from "../utils/constants.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type CreateEntityBody = {
  category: EntityCategory;
  displayName: string;
  schedule: string;
};

type GetEntitiesQuery = {
  category?: EntityCategory;
};

type DeleteEntityQuery = {
  id: string;
  category: EntityCategory;
  schedule: string;
};

async function createEntity(
  req: Request<{}, { id: string }, CreateEntityBody, {}>,
  res: Response,
) {
  const { displayName, category, schedule } = req.body;
  let result;

  const findSchedule = await Schedule.findById(schedule);
  if (!findSchedule) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid schedule.");
  }

  try {
    switch (category) {
      case EntityCategory.TEACHER:
        const teacherResult = await Teacher.create({ displayName });
        result = teacherResult;
        findSchedule.teachers.push(teacherResult._id);
        break;
      case EntityCategory.GROUP:
        const groupResult = await Group.create({ displayName });
        result = groupResult;
        findSchedule.groups.push(groupResult._id);
        break;
      case EntityCategory.LOCATION:
        const locationResult = await Location.create({ displayName });
        result = locationResult;
        findSchedule.locations.push(locationResult._id);
        break;
      default:
        throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid category.");
    }
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

async function getEntities(
  req: Request<{}, Array<Entity>, {}, GetEntitiesQuery>,
  res: Response,
) {
  const { category } = req.query;

  try {
    if (!category) {
      const [teachers, groups, locations] = await Promise.all([
        Teacher.find(),
        Group.find(),
        Location.find(),
      ]);
      const entities: Entity[] = [
        ...teachers.map((t) => ({
          id: t._id.toString(),
          displayName: t.displayName,
        })),
        ...groups.map((g) => ({
          id: g._id.toString(),
          displayName: g.displayName,
        })),
        ...locations.map((l) => ({
          id: l._id.toString(),
          displayName: l.displayName,
        })),
      ];
      res.json(entities);
      return;
    }

    let entities: Entity[] = [];
    switch (category) {
      case EntityCategory.TEACHER:
        const teachers = await Teacher.find();
        entities = teachers.map((t) => ({
          id: t._id.toString(),
          displayName: t.displayName,
        }));
        break;
      case EntityCategory.GROUP:
        const groups = await Group.find();
        entities = groups.map((g) => ({
          id: g._id.toString(),
          displayName: g.displayName,
        }));
        break;
      case EntityCategory.LOCATION:
        const locations = await Location.find();
        entities = locations.map((l) => ({
          id: l._id.toString(),
          displayName: l.displayName,
        }));
        break;
      default:
        throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid category.");
    }
    sendValidResponse<Entity[]>(res, SuccessCode.OK, entities);
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

async function deleteEntity(
  req: Request<{}, void, {}, DeleteEntityQuery>,
  res: Response,
) {
  const { id, category, schedule } = req.query;

  const findSchedule = await Schedule.findById(schedule);
  if (!findSchedule) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid schedule.");
  }

  try {
    switch (category) {
      case EntityCategory.TEACHER:
        await Teacher.deleteOne({ _id: id });
        await Schedule.findByIdAndUpdate(schedule, { $pull: { teachers: id } });
        break;
      case EntityCategory.GROUP:
        await Group.deleteOne({ _id: id });
        await Schedule.findByIdAndUpdate(schedule, { $pull: { groups: id } });
        break;
      case EntityCategory.LOCATION:
        await Location.deleteOne({ _id: id });
        await Schedule.findByIdAndUpdate(schedule, {
          $pull: { locations: id },
        });
        break;
      default:
        throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Invalid category.");
    }
  } catch (error) {
    console.error(error);
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }

  return sendValidResponse(res, SuccessCode.NO_CONTENT);
}

export default { createEntity, getEntities, deleteEntity };
