import { IUser } from "./User";
import { IPost } from "./Post";
import mongoose, { model, models, Schema } from "mongoose";

export interface ILike {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId | IUser;
  post: mongoose.Types.ObjectId | IPost;
  createdAt?: Date;
  updatedAt?: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

LikeSchema.index({ author: 1, post: 1 }, { unique: true });

LikeSchema.index({ author: 1 });
LikeSchema.index({ post: 1 });

const Like = models?.Like || model<ILike>("Like", LikeSchema);
export default Like;
