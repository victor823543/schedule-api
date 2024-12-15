import { Schema, Types, model } from "mongoose";

export type IGroup = {
  _id: Types.ObjectId;
  displayName: string;
};

const groupSchema = new Schema<IGroup>({
  displayName: { type: String, required: true },
});

export const Group = model("Group", groupSchema);
