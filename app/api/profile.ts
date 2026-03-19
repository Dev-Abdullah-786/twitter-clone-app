import User from "../models/User";
import { getServerSession } from "next-auth";
import { initMongoose } from "../lib/mongoose";
import { authOptions, UserWithId } from "../lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

interface UpdateProfileBody {
  bio?: string;
  name?: string;
  username?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await initMongoose();

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.method !== "PUT") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { bio, name, username } = req.body as UpdateProfileBody;

    await User.findByIdAndUpdate((session.user as UserWithId).id, {
      bio,
      name,
      username,
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
