import mongoose from "mongoose";

export async function initMongoose(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const MONGODB_URI = process.env.MONGODB_URI as string;
  await mongoose.connect(MONGODB_URI);

  return mongoose;
}
