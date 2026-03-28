import axios from "axios";
import { useRouter } from "next/router";
import Layout from "@/app/components/Layout";
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

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);

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
        </div>
      )}
    </Layout>
  );
}
