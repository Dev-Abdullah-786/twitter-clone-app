import { IUser } from "./User";
import mongoose, { model, models, Schema } from "mongoose";

export interface IPost {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId | IUser;
  text?: string;
  likesCount: number;
  commentsCount: number;
  parent?: mongoose.Types.ObjectId | IPost;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxlength: [5000, "Text cannot exceed 5000 characters"],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    parent: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 4;
        },
        message: "A post cannot have more than 4 images",
      },
    },
  },
  {
    timestamps: true,
  },
);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ parent: 1 });

const Post = models?.Post || model<IPost>("Post", PostSchema);
export default Post;
