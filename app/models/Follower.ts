import { IUser } from "./User";
import mongoose, { model, models, Schema } from "mongoose";

export interface IFollower {
  _id?: mongoose.Types.ObjectId;
  source: mongoose.Types.ObjectId | IUser;
  destination: mongoose.Types.ObjectId | IUser;
  createdAt?: Date;
  updatedAt?: Date;
}

const FollowerSchema = new Schema<IFollower>(
  {
    source: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Source user is required"],
    },
    destination: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Destination user is required"],
    },
  },
  {
    timestamps: true,
  },
);

FollowerSchema.index({ source: 1, destination: 1 }, { unique: true });

FollowerSchema.index({ source: 1, createdAt: -1 });
FollowerSchema.index({ destination: 1, createdAt: -1 });

const Follower =
  models?.Follower || model<IFollower>("Follower", FollowerSchema);
export default Follower;
