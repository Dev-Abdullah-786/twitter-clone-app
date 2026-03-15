import User, { IUser } from "../models/User";
import { initMongoose } from "../lib/mongoose";
import { unstable_getServerSession } from "next-auth";
import { authOptions, UserWithId } from "../lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import Follower, { IFollower } from "../models/Follower";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  await initMongoose();
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "PUT") {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      res
        .status(400)
        .json({ error: "Username is required and must be a string" });
      return;
    }

    await User.findByIdAndUpdate((session?.user as UserWithId).id, {
      username,
    });
    res.json("ok");
  }

  if (req.method === "GET") {
    const { id, username } = req.query;

    if (!id && !username) {
      res.status(400).json({ error: "Either id or username is required" });
      return;
    }

    const user: IUser | null = id
      ? await User.findById(id)
      : await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const follow: IFollower | null = await Follower.findOne({
      source: (session?.user as UserWithId).id,
      destination: user._id,
    });

    res.json({ user, follow });
  }
}
