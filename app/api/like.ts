import Post from "../models/Post";
import Like from "../models/Like";
import { authOptions } from "../lib/auth";
import { getServerSession } from "next-auth";
import { initMongoose } from "../lib/mongoose";
import { NextApiRequest, NextApiResponse } from "next";

async function updateLikesCount(postId: string): Promise<void> {
  const post = await Post.findById(postId);
  if (post) {
    post.likesCount = await Like.countDocuments({ post: postId });
    await post.save();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await initMongoose();

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const postId = req.body.id;
    const userId = (session.user as { id: string }).id;

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const existingLike = await Like.findOne({
      author: userId,
      post: postId,
    });

    if (existingLike) {
      await existingLike.deleteOne();
      await updateLikesCount(postId);
      return res.json(null);
    } else {
      const like = await Like.create({
        author: userId,
        post: postId,
      });
      await updateLikesCount(postId);
      return res.status(201).json({ like });
    }
  } catch (error) {
    console.error("Error in like API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
