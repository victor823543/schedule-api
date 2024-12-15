import { Schema, Types, model } from "mongoose";

export type ILocation = {
  _id: Types.ObjectId;
  displayName: string;
};

const locationSchema = new Schema<ILocation>({
  displayName: { type: String, required: true },
});

export const Location = model("Location", locationSchema);
