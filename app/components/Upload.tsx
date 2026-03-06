import { useState } from "react";
import { FileDrop } from "react-file-drop";

type UploadProps = {
  children: (props: { isUploading: boolean }) => React.ReactNode;
  onUploadFinish: (src: string) => void;
};

export default function Upload({ children, onUploadFinish }: UploadProps) {
  const [isFileNearby, setIsFileNearby] = useState<boolean>(false);
  const [isFileOver, setIsFileOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  async function uploadImage(
    files: FileList | null,
    e: React.DragEvent<HTMLDivElement>,
  ) {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setIsFileNearby(false);
    setIsFileOver(false);
    setIsUploading(true);

    const data = new FormData();
    data.append("post", files[0]);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    const json = await response.json();
    const src: string = json.src;

    onUploadFinish(src);
    setIsUploading(false);
  }

  return (
    <FileDrop
      onDrop={uploadImage}
      onDragOver={() => setIsFileOver(true)}
      onDragLeave={() => setIsFileOver(false)}
      onFrameDragEnter={() => setIsFileNearby(true)}
      onFrameDragLeave={() => setIsFileNearby(false)}
      onFrameDrop={() => {
        setIsFileNearby(false);
        setIsFileOver(false);
      }}
    >
      <div className="relative">
        {(isFileNearby || isFileOver) && (
          <div className="bg-twitterBlue absolute inset-0 flex items-center justify-center">
            drop your images here
          </div>
        )}
        {children({ isUploading })}
      </div>
    </FileDrop>
  );
}
