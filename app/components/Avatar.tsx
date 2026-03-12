import EditableImage from "./EditableImage";

interface AvatarProps {
  src?: string | null;
  big?: boolean;
  onChange?: (src: string) => void;
  editable?: boolean;
}

export default function Avatar({
  src,
  big = false,
  onChange,
  editable = false,
}: AvatarProps) {
  const widthClass = big ? "w-24" : "w-12";

  return (
    <div className="rounded-full overflow-hidden">
      <EditableImage
        type="image"
        src={src}
        onChange={onChange || (() => {})}
        editable={editable}
        className={`rounded-full overflow-hidden ${widthClass}`}
      />
    </div>
  );
}
