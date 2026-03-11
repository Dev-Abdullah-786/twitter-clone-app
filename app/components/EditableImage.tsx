import Image from "next/image";
import { useState } from "react";
import { FileDrop } from "react-file-drop";
import { PulseLoader } from "react-spinners";

interface EditableImageProps {
  type: string;
  src?: string | null;
  onChange: (src: string) => void;
  className?: string;
  editable?: boolean;
}

export default function EditableImage({
  type,
  src,
  onChange,
  className = "",
  editable = false,
}: EditableImageProps) {
  const [isFileNearby, setIsFileNearby] = useState<boolean>(false);
  const [isFileOver, setIsFileOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  let extraClasses = "";
  if (isFileNearby && !isFileOver) extraClasses += " bg-blue-500 opacity-40";
  if (isFileOver) extraClasses += " bg-blue-500 opacity-90";
  if (!editable) extraClasses = "";

  function updateImage(files: FileList | null, e: React.DragEvent) {
    if (!editable || !files || files.length === 0) {
      return;
    }

    e.preventDefault();
    setIsFileNearby(false);
    setIsFileOver(false);
    setIsUploading(true);

    const data = new FormData();
    data.append(type, files[0]);

    fetch("/api/upload", {
      method: "POST",
      body: data,
    })
      .then(async (response: Response) => {
        if (!response.ok) {
          throw new Error("Upload failed");
        }
        const json = await response.json();
        onChange(json.src);
        setIsUploading(false);
      })
      .catch((error: Error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
      });
  }

  return (
    <FileDrop
      onDrop={updateImage}
      onDragOver={() => setIsFileOver(true)}
      onDragLeave={() => setIsFileOver(false)}
      onFrameDragEnter={() => setIsFileNearby(true)}
      onFrameDragLeave={() => setIsFileNearby(false)}
      onFrameDrop={() => {
        setIsFileNearby(false);
        setIsFileOver(false);
      }}
    >
      <div className="bg-twitterBorder text-white relative">
        <div className={`absolute inset-0 ${extraClasses}`}></div>
        {isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(48, 140, 216,0.9)" }}
          >
            <PulseLoader size={14} color="#fff" />
          </div>
        )}
        <div className={`cover flex items-center overflow-hidden ${className}`}>
          {src && <Image src={src} className="w-full" alt="Uploaded content" />}
        </div>
      </div>
    </FileDrop>
  );
}
