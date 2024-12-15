import { Schema, model } from "mongoose";

export type ITeacher = {
  displayName: string;
};

const teacherSchema = new Schema<ITeacher>({
  displayName: { type: String, required: true },
});

export const Teacher = model("Teacher", teacherSchema);
