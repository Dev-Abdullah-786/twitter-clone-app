import axios from "axios";
import { useRouter } from "next/router";
import Layout from "@/app/components/Layout";
import PostForm from "@/app/components/PostForm";
import useUserInfo from "@/app/hooks/useUserInfo";
import TopNavLink from "@/app/components/TopNavLink";
import PostContent from "@/app/components/PostContent";
import { useEffect, useState, useCallback } from "react";

interface Author {
  _id: string;
  name: string;
  username: string;
  image?: string;
}

interface Post {
  _id: string;
  text?: string;
  author: Author;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  images?: string[];
  parent?: Post;
  likedByMe?: boolean;
}

interface PostResponse {
  post: Post;
}

interface RepliesResponse {
  posts: Post[];
  idsLikedByMe: string[];
}

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { userInfo } = useUserInfo();
  const [replies, setReplies] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [repliesLikedByMe, setRepliesLikedByMe] = useState<string[]>([]);

  const fetchData = useCallback(() => {
    if (!id || typeof id !== "string") {
      return;
    }

    axios
      .get<PostResponse>("/api/posts?id=" + id)
      .then((response) => {
        setPost(response.data.post);
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
      });

    axios
      .get<RepliesResponse>("/api/posts?parent=" + id)
      .then((response) => {
        setReplies(response.data.posts);
        setRepliesLikedByMe(response.data.idsLikedByMe);
      })
      .catch((error) => {
        console.error("Error fetching replies:", error);
      });
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Layout>
      {post?._id && (
        <div className="px-5 py-2">
          <TopNavLink />

          {post.parent && (
            <div className="pb-1">
              <PostContent
                text={post.parent.text}
                author={post.parent.author}
                createdAt={post.parent.createdAt}
                _id={post.parent._id}
                likesCount={post.parent.likesCount}
                likedByMe={post.parent.likedByMe}
                commentsCount={post.parent.commentsCount}
                images={post.parent.images}
              />
              <div className="ml-5 h-12 relative">
                <div
                  className="h-20 border-l-2 border-twitterBorder absolute -top-5"
                  style={{ marginLeft: "2px" }}
                ></div>
              </div>
            </div>
          )}

          <div>
            <PostContent
              text={post.text}
              author={post.author}
              createdAt={post.createdAt}
              _id={post._id}
              likesCount={post.likesCount}
              likedByMe={post.likedByMe}
              commentsCount={post.commentsCount}
              images={post.images}
              big={true}
            />
          </div>
        </div>
      )}

      {userInfo && (
        <div className="border-t border-twitterBorder py-5">
          <PostForm
            onPost={fetchData}
            parent={id as string}
            compact
            placeholder="Tweet your reply"
          />
        </div>
      )}

      <div>
        {replies.length > 0 &&
          replies.map((reply) => (
            <div className="p-5 border-t border-twitterBorder" key={reply._id}>
              <PostContent
                text={reply.text}
                author={reply.author}
                createdAt={reply.createdAt}
                _id={reply._id}
                likesCount={reply.likesCount}
                likedByMe={repliesLikedByMe.includes(reply._id)}
                commentsCount={reply.commentsCount}
                images={reply.images}
              />
            </div>
          ))}
      </div>
    </Layout>
  );
}
