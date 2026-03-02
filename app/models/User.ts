import { model, models, Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  cover: string;
  bio: string;
  username: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: false },
    image: { type: String, required: false },
    cover: { type: String, required: false },
    bio: { type: String, required: false },
    username: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
