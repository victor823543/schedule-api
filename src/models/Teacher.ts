import { Schema, Types, model } from "mongoose";

export type ITeacher = {
  _id: Types.ObjectId;
  displayName: string;
};

const teacherSchema = new Schema<ITeacher>({
  displayName: { type: String, required: true },
});

export const Teacher = model("Teacher", teacherSchema);
