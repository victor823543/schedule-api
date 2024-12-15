import { Schema, Types, model } from "mongoose";

export type ICourse = {
  _id: Types.ObjectId;
  displayName: string;
  subject: string;
};

const courseSchema = new Schema<ICourse>({
  displayName: { type: String, required: true },
  subject: { type: String, required: true },
});

export const Course = model("Course", courseSchema);
