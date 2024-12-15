import { Schema, model } from "mongoose";

export type IGroup = {
  displayName: string;
};

const groupSchema = new Schema<IGroup>({
  displayName: { type: String, required: true },
});

export const Group = model("Group", groupSchema);
