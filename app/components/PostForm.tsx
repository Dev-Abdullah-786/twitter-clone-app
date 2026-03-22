import axios from "axios";
import Avatar from "./Avatar";
import Upload from "./Upload";
import Image from "next/image";
import { useState } from "react";
import { PulseLoader } from "react-spinners";
import useUserInfo from "../hooks/useUserInfo";

interface PostFormProps {
  onPost?: () => void;
  compact?: boolean;
  parent?: string;
  placeholder?: string;
}

export default function PostForm({
  onPost,
  compact,
  parent,
  placeholder = "What's happening?",
}: PostFormProps) {
  const { userInfo, status } = useUserInfo();
  const [text, setText] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  async function handlePostSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await axios.post("/api/posts", { text, parent, images });
    setText("");
    setImages([]);
    if (onPost) {
      onPost();
    }
  }

  if (status === "loading") {
    return null;
  }

  return (
    <form className="mx-5" onSubmit={handlePostSubmit}>
      <div className={(compact ? "items-center" : "") + " flex"}>
        <div className="">
          <Avatar src={userInfo?.image} />
        </div>
        <div className="grow pl-2">
          <Upload
            onUploadFinish={(src: string) =>
              setImages((prev) => [...prev, src])
            }
          >
            {({ isUploading }: { isUploading: boolean }) => (
              <div>
                <textarea
                  className={
                    (compact ? "h-10 mt-1" : "h-24") +
                    " w-full p-2 bg-transparent text-twitterWhite"
                  }
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setText(e.target.value)
                  }
                  placeholder={placeholder}
                />
                <div className="flex -mx-2">
                  {images.length > 0 &&
                    images.map((img) => (
                      <div className="h-24 m-2" key={img}>
                        <Image src={img} alt="post image" className="h-24" />
                      </div>
                    ))}
                  {isUploading && (
                    <div className="h-24 w-24 m-2 bg-twitterBorder flex items-center justify-center">
                      <PulseLoader size={14} color={"#fff"} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Upload>
          {!compact && (
            <div className="text-right border-t border-twitterBorder pt-2 pb-2">
              <button className="bg-twitterBlue text-white px-5 py-1 rounded-full">
                Tweet
              </button>
            </div>
          )}
        </div>
        {compact && (
          <div className="pl-2">
            <button className="bg-twitterBlue text-white px-5 py-1 rounded-full">
              Tweet
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
