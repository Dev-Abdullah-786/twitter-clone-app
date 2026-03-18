import { Types } from "mongoose";
import { authOptions } from "../lib/auth";
import Follower from "../models/Follower";
import { getServerSession } from "next-auth";
import { initMongoose } from "../lib/mongoose";
import { NextApiRequest, NextApiResponse } from "next";

interface IFollower {
  _id: Types.ObjectId | string;
  source: Types.ObjectId | string;
  destination: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
  remove?(): Promise<IFollower>;
}

interface FollowerRequestBody {
  destination: string;
}

interface FollowerResponse {
  _id: string;
  source: string;
  destination: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FollowerResponse | ErrorResponse | null>,
) {
  try {
    await initMongoose();

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const sessionUser = session.user as { id?: string };
    if (!sessionUser?.id) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    const { destination } = req.body as FollowerRequestBody;

    if (!destination) {
      return res.status(400).json({ error: "Destination user ID is required" });
    }

    if (destination === sessionUser.id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const source = sessionUser.id;

    const existingFollow = (await Follower.findOne({
      destination,
      source,
    })) as IFollower | null;

    if (existingFollow) {
      if (existingFollow.remove) {
        await existingFollow.remove();
      } else {
        await Follower.deleteOne({ _id: existingFollow._id });
      }

      return res.status(200).json(null);
    } else {
      const follow = (await Follower.create({
        destination,
        source,
      })) as IFollower;

      return res.status(201).json({
        _id: follow._id.toString(),
        source: follow.source.toString(),
        destination: follow.destination.toString(),
        createdAt: follow.createdAt,
        updatedAt: follow.updatedAt,
      });
    }
  } catch (error) {
    console.error("Error in followers API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
