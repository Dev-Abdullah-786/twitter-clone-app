import axios from "axios";
import { useRouter } from "next/router";
import Cover from "../components/Cover";
import Layout from "../components/Layout";
import Avatar from "../components/Avatar";
import { useEffect, useState } from "react";
import useUserInfo from "../hooks/useUserInfo";
import TopNavLink from "../components/TopNavLink";
import PostContent from "../components/PostContent";

interface Author {
  _id: string;
  name: string;
  username: string;
  image?: string;
  cover?: string;
  bio?: string;
}

interface UserProfile extends Author {
  cover?: string;
  bio?: string;
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

interface UserResponse {
  user: UserProfile;
  follow?: {
    _id: string;
    source: string;
    destination: string;
  } | null;
}

interface PostsResponse {
  posts: Post[];
  idsLikedByMe: string[];
}

export default function UserPage() {
  const router = useRouter();
  const { username } = router.query;
  const { userInfo } = useUserInfo();

  const [posts, setPosts] = useState<Post[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [postsLikedByMe, setPostsLikedByMe] = useState<string[]>([]);
  const [profileInfo, setProfileInfo] = useState<UserProfile | null>(null);
  const [originalUserInfo, setOriginalUserInfo] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!username || typeof username !== "string") {
      return;
    }

    axios
      .get<UserResponse>("/api/users?username=" + username)
      .then((response) => {
        setProfileInfo(response.data.user);
        setOriginalUserInfo(response.data.user);
        setIsFollowing(!!response.data.follow);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  }, [username]);

  useEffect(() => {
    if (!profileInfo?._id) {
      return;
    }

    axios
      .get<PostsResponse>("/api/posts?author=" + profileInfo._id)
      .then((response) => {
        setPosts(response.data.posts);
        setPostsLikedByMe(response.data.idsLikedByMe);
      })
      .catch((error) => {
        console.error("Error fetching user posts:", error);
      });
  }, [profileInfo]);

  function updateUserImage(type: "image" | "cover", src: string) {
    setProfileInfo((prev) => {
      if (!prev) return prev;
      return { ...prev, [type]: src };
    });
  }

  async function updateProfile() {
    if (!profileInfo) return;

    const { bio, name, username } = profileInfo;
    await axios.put("/api/profile", {
      bio,
      name,
      username,
    });
    setEditMode(false);
  }

  function cancel() {
    if (!originalUserInfo) return;

    setProfileInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        bio: originalUserInfo.bio,
        name: originalUserInfo.name,
        username: originalUserInfo.username,
      };
    });
    setEditMode(false);
  }

  function toggleFollow() {
    setIsFollowing((prev) => !prev);
    axios
      .post("/api/followers", {
        destination: profileInfo?._id,
      })
      .catch((error) => {
        console.error("Error toggling follow:", error);
        setIsFollowing((prev) => !prev);
      });
  }

  const isMyProfile = profileInfo?._id === userInfo?._id;

  return (
    <Layout>
      {profileInfo && (
        <div>
          <div className="px-5 pt-2">
            <TopNavLink title={profileInfo.name} />
          </div>

          <Cover
            src={profileInfo.cover}
            editable={isMyProfile}
            onChange={(src: string) => updateUserImage("cover", src)}
          />

          <div className="flex justify-between">
            <div className="ml-5 relative">
              <div className="absolute -top-12 border-4 rounded-full border-black overflow-hidden">
                <Avatar
                  big
                  src={profileInfo.image}
                  editable={isMyProfile}
                  onChange={(src: string) => updateUserImage("image", src)}
                />
              </div>
            </div>

            <div className="p-2">
              {!isMyProfile && (
                <button
                  onClick={toggleFollow}
                  className={`${isFollowing ? "bg-twitterWhite text-black" : "bg-twitterBlue text-white"} py-2 px-5 rounded-full`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}

              {isMyProfile && (
                <div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-twitterBlue text-white py-2 px-5 rounded-full"
                    >
                      Edit profile
                    </button>
                  )}

                  {editMode && (
                    <div>
                      <button
                        onClick={cancel}
                        className="bg-twitterWhite text-black py-2 px-5 rounded-full mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updateProfile}
                        className="bg-twitterBlue text-white py-2 px-5 rounded-full"
                      >
                        Save profile
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 mt-2">
            {!editMode && (
              <h1 className="font-bold text-xl leading-5">
                {profileInfo.name}
              </h1>
            )}
            {editMode && (
              <div>
                <input
                  type="text"
                  value={profileInfo.name || ""}
                  onChange={(ev) =>
                    setProfileInfo((prev) => {
                      if (!prev) return prev;
                      return { ...prev, name: ev.target.value };
                    })
                  }
                  className="bg-twitterBorder p-2 mb-2 rounded-full w-full"
                  placeholder="Name"
                />
              </div>
            )}

            {!editMode && (
              <h2 className="text-twitterLightGray text-sm">
                @{profileInfo.username}
              </h2>
            )}
            {editMode && (
              <div>
                <input
                  type="text"
                  value={profileInfo.username || ""}
                  onChange={(ev) =>
                    setProfileInfo((prev) => {
                      if (!prev) return prev;
                      return { ...prev, username: ev.target.value };
                    })
                  }
                  className="bg-twitterBorder p-2 mb-2 rounded-full w-full"
                  placeholder="Username"
                />
              </div>
            )}

            {!editMode && (
              <div className="text-sm mt-2 mb-2">{profileInfo.bio}</div>
            )}
            {editMode && (
              <div>
                <textarea
                  value={profileInfo.bio || ""}
                  onChange={(ev) =>
                    setProfileInfo((prev) => {
                      if (!prev) return prev;
                      return { ...prev, bio: ev.target.value };
                    })
                  }
                  className="bg-twitterBorder p-2 mb-2 rounded-2xl w-full block"
                  placeholder="Bio"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {posts?.length > 0 &&
        posts.map((post) => (
          <div className="p-5 border-t border-twitterBorder" key={post._id}>
            <PostContent
              text={post.text}
              author={post.author}
              createdAt={post.createdAt}
              _id={post._id}
              likesCount={post.likesCount}
              likedByMe={postsLikedByMe.includes(post._id)}
              commentsCount={post.commentsCount}
              images={post.images}
            />
          </div>
        ))}
    </Layout>
  );
}
