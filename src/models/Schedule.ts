import { model, Schema, Types } from "mongoose";

export type ISchedule = {
  _id: Types.ObjectId;
  displayName: string;
  start: string;
  end: string;
  teachers: Types.ObjectId[];
  groups: Types.ObjectId[];
  locations: Types.ObjectId[];
};

const scheduleSchema = new Schema<ISchedule>({
  displayName: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  teachers: [{ type: Types.ObjectId, ref: "Teacher" }],
  groups: [{ type: Types.ObjectId, ref: "Group" }],
  locations: [{ type: Types.ObjectId, ref: "Location" }],
});

export const Schedule = model("Schedule", scheduleSchema);
