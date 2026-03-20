import { Types } from "mongoose";
import Like from "../models/Like";
import Post from "../models/Post";
import Follower from "../models/Follower";
import { getServerSession } from "next-auth";
import { initMongoose } from "../lib/mongoose";
import { authOptions, UserWithId } from "../lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  username: string;
  image?: string;
}

interface IPost {
  _id: Types.ObjectId | string;
  text?: string;
  author: IUser | Types.ObjectId;
  parent?: IPost | Types.ObjectId;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
}

interface ILike {
  _id: Types.ObjectId | string;
  author: Types.ObjectId | string;
  post: Types.ObjectId | string;
}

interface IFollower {
  _id: Types.ObjectId | string;
  source: Types.ObjectId | string;
  destination: Types.ObjectId | string;
}

interface AuthorFilter {
  author: string;
}

interface ParentFilter {
  parent: string;
}

interface FollowingFilter {
  author: {
    $in: string[];
  };
}

type PostFilter =
  | AuthorFilter
  | ParentFilter
  | FollowingFilter
  | Record<string, never>;

interface PostsQuery {
  id?: string;
  parent?: string;
  author?: string;
}

interface PostBody {
  text?: string;
  parent?: string;
  images?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await initMongoose();

    const session = await getServerSession(req, res, authOptions);

    if (req.method === "GET") {
      const { id, parent, author } = req.query as PostsQuery;

      if (id) {
        const post = await Post.findById(id)
          .populate<{ author: IUser }>("author")
          .populate<{ parent: IPost }>({
            path: "parent",
            populate: { path: "author" },
          })
          .exec();

        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }

        return res.json({ post });
      }

      let searchFilter: PostFilter = {};

      if (!author && !parent) {
        if (!session) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const sessionUser = session.user as UserWithId | undefined;
        if (!sessionUser?.id) {
          return res.status(401).json({ error: "Invalid user session" });
        }

        const userId = sessionUser.id.toString();

        const myFollows = await Follower.find({
          source: userId,
        }).exec();

        const idsOfPeopleIFollow = myFollows.map((f: IFollower) =>
          f.destination.toString(),
        );

        searchFilter = {
          author: {
            $in: [...idsOfPeopleIFollow, userId],
          },
        };
      } else if (author) {
        searchFilter = { author };
      } else if (parent) {
        searchFilter = { parent };
      }

      const posts = await Post.find(searchFilter)
        .populate<{ author: IUser }>("author")
        .populate<{ parent: IPost }>({
          path: "parent",
          populate: { path: "author" },
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();

      let postsLikedByMe: ILike[] = [];
      let idsLikedByMe: string[] = [];

      if (session) {
        const sessionUser = session.user as UserWithId | undefined;
        if (sessionUser?.id) {
          postsLikedByMe = await Like.find({
            author: sessionUser.id,
            post: { $in: posts.map((p) => p._id) },
          }).exec();

          idsLikedByMe = postsLikedByMe.map((like) => like.post.toString());
        }
      }

      return res.json({
        posts,
        idsLikedByMe,
      });
    }

    if (req.method === "POST") {
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const sessionUser = session.user as UserWithId | undefined;
      if (!sessionUser?.id) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const { text, parent, images } = req.body as PostBody;

      if (!text && (!images || images.length === 0)) {
        return res.status(400).json({
          error: "Post must contain either text or images",
        });
      }

      const post = await Post.create({
        author: sessionUser.id,
        text: text || "",
        parent: parent || null,
        images: images || [],
      });

      if (parent) {
        const parentPost = await Post.findById(parent);
        if (parentPost) {
          parentPost.commentsCount = await Post.countDocuments({ parent });
          await parentPost.save();
        }
      }

      const populatedPost = await Post.findById(post._id)
        .populate<{ author: IUser }>("author")
        .exec();

      return res.status(201).json(populatedPost);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in posts API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
