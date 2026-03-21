import Link from "next/link";
import Avatar from "./Avatar";
import Image from "next/image";
import PostButtons from "./PostButtons";
import ReactTimeAgo from "react-time-ago";

interface Author {
  _id?: string;
  name?: string;
  username?: string;
  image?: string;
}

interface PostContentProps {
  text?: string;
  author?: Author | null;
  createdAt?: string | Date;
  _id?: string;
  likesCount?: number;
  likedByMe?: boolean;
  commentsCount?: number;
  images?: string[];
  big?: boolean;
}

export default function PostContent({
  text,
  author,
  createdAt,
  _id,
  likesCount = 0,
  likedByMe = false,
  commentsCount = 0,
  images,
  big = false,
}: PostContentProps) {
  function showImages() {
    if (!images?.length) {
      return null;
    }

    return (
      <div className="flex -mx-1 mt-2">
        {images.map((img: string) => (
          <div className="m-1" key={img}>
            <Image
              src={img}
              alt="Post image"
              className="rounded-lg max-h-96 object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  function formatDate(date: string | Date): string {
    return new Date(date)
      .toISOString()
      .replace("T", " ")
      .slice(0, 16)
      .split(" ")
      .reverse()
      .join(" ");
  }

  return (
    <div>
      <div className="flex w-full">
        <div>
          {author?.image && (
            <Link href={`/${author?.username}`} className="cursor-pointer">
              <Avatar src={author.image} />
            </Link>
          )}
        </div>

        <div className="pl-2 grow">
          <div>
            <Link
              href={`/${author?.username}`}
              className="font-bold pr-1 cursor-pointer"
            >
              {author?.name}
            </Link>

            {big && <br />}

            <Link
              href={`/${author?.username}`}
              className="text-twitterLightGray cursor-pointer"
            >
              @{author?.username}
            </Link>

            {createdAt && !big && (
              <span className="pl-1 text-twitterLightGray">
                <ReactTimeAgo date={new Date(createdAt)} timeStyle="twitter" />
              </span>
            )}
          </div>

          {!big && (
            <div>
              <Link
                href={`/${author?.username}/status/${_id}`}
                className="w-full cursor-pointer"
              >
                <div>
                  {text}
                  {showImages()}
                </div>
              </Link>
              <PostButtons
                username={author?.username || ""}
                id={_id || ""}
                likesCount={likesCount}
                likedByMe={likedByMe}
                commentsCount={commentsCount}
              />
            </div>
          )}
        </div>
      </div>

      {big && (
        <div className="mt-2">
          <Link href={`/${author?.username}/status/${_id}`}>
            <div>
              {text}
              {showImages()}
            </div>
          </Link>

          {createdAt && (
            <div className="text-twitterLightGray text-sm mt-2">
              {formatDate(createdAt)}
            </div>
          )}

          <PostButtons
            username={author?.username || ""}
            id={_id || ""}
            likesCount={likesCount}
            likedByMe={likedByMe}
            commentsCount={commentsCount}
          />
        </div>
      )}
    </div>
  );
}
