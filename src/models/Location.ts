import { Schema, model } from "mongoose";

export type ILocation = {
  displayName: string;
};

const locationSchema = new Schema<ILocation>({
  displayName: { type: String, required: true },
});

export const Location = model("Location", locationSchema);
