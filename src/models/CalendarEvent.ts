import { model, Schema, Types } from "mongoose";

export type ICalendarEvent = {
  _id: Types.ObjectId;
  belongsTo: Types.ObjectId;
  type?: "LUNCH";
  course?: Types.ObjectId;
  teachers: Types.ObjectId[];
  groups: Types.ObjectId[];
  locations: Types.ObjectId[];
  start: Date;
  end: Date;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  cancelled?: boolean;
};

const calendarEventSchema = new Schema<ICalendarEvent>({
  belongsTo: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
  type: { type: String, enum: ["LUNCH"], required: false },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: false },
  teachers: [{ type: Schema.Types.ObjectId, ref: "Teacher", required: true }],
  groups: [{ type: Schema.Types.ObjectId, ref: "Group", required: true }],
  locations: [{ type: Schema.Types.ObjectId, ref: "Location", required: true }],
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  duration: { type: Number, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: () => Math.floor(new Date().getTime() / 1000),
  },
  updatedAt: {
    type: Date,
    required: true,
    default: () => Math.floor(new Date().getTime() / 1000),
  },
  color: { type: String, required: true },
  cancelled: {
    type: Boolean,
    default: false,
  },
});

export const CalendarEvent = model("CalendarEvent", calendarEventSchema);
