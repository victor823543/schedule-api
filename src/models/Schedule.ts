import { model, Schema, Types } from "mongoose";

export type ISchedule = {
  _id: Types.ObjectId;
  displayName: string;
  teachers: Types.ObjectId[];
  groups: Types.ObjectId[];
  locations: Types.ObjectId[];
  courses: Types.ObjectId[];
};

const scheduleSchema = new Schema<ISchedule>({
  displayName: { type: String, required: true },
  teachers: [{ type: Types.ObjectId, ref: "Teacher", default: [] }],
  groups: [{ type: Types.ObjectId, ref: "Group", default: [] }],
  locations: [{ type: Types.ObjectId, ref: "Location", default: [] }],
  courses: [{ type: Types.ObjectId, ref: "Course", default: [] }],
});

export const Schedule = model("Schedule", scheduleSchema);
