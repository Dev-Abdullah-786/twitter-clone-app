import axios from "axios";
import { useRouter } from "next/router";
import Layout from "./components/Layout";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import PostForm from "./components/PostForm";
import useUserInfo from "./hooks/useUserInfo";
import PostContent from "./components/PostContent";
import UsernameForm from "./components/UsernameForm";

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

interface PostsResponse {
  posts: Post[];
  idsLikedByMe: string[];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [idsLikedByMe, setIdsLikedByMe] = useState<string[]>([]);
  const { userInfo, setUserInfo, status: userInfoStatus } = useUserInfo();

  const router = useRouter();

  const fetchHomePosts = () => {
    axios.get<PostsResponse>("/api/posts").then((response) => {
      setPosts(response.data.posts);
      setIdsLikedByMe(response.data.idsLikedByMe);
    });
  };

  async function logout() {
    setUserInfo(null);
    await signOut();
  }

  useEffect(() => {
    if (userInfoStatus === "loading") return;

    if (!userInfo) {
      router.push("/login");
    }
  }, [userInfo, userInfoStatus, router]);

  if (userInfoStatus === "loading") {
    return <div>Loading user info...</div>;
  }

  if (userInfo && !userInfo?.username) {
    return <UsernameForm />;
  }

  if (!userInfo) {
    return <div>Redirecting...</div>;
  }

  return (
    <Layout>
      <h1 className="text-lg font-bold p-4">Home</h1>
      <PostForm
        onPost={() => {
          fetchHomePosts();
        }}
      />
      <div className="">
        {posts.length > 0 &&
          posts.map((post) => (
            <div className="border-t border-twitterBorder p-5" key={post._id}>
              {post.parent && (
                <div>
                  <PostContent
                    text={post.parent.text}
                    author={post.parent.author}
                    createdAt={post.parent.createdAt}
                    _id={post.parent._id}
                    likesCount={post.parent.likesCount}
                    likedByMe={idsLikedByMe.includes(post.parent._id)}
                    commentsCount={post.parent.commentsCount}
                    images={post.parent.images}
                  />
                  <div className="relative h-8">
                    <div className="border-l-2 border-twitterBorder h-10 absolute ml-6 -top-4"></div>
                  </div>
                </div>
              )}
              <PostContent
                text={post.text}
                author={post.author}
                createdAt={post.createdAt}
                _id={post._id}
                likesCount={post.likesCount}
                likedByMe={idsLikedByMe.includes(post._id)}
                commentsCount={post.commentsCount}
                images={post.images}
              />
            </div>
          ))}
      </div>
      <div className="p-5 text-center border-t border-twitterBorder">
        {userInfo && (
          <button
            onClick={logout}
            className="bg-twitterWhite text-black px-5 py-2 rounded-full"
          >
            Logout
          </button>
        )}
      </div>
    </Layout>
  );
}
