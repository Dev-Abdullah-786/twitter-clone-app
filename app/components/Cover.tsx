import EditableImage from "./EditableImage";

interface CoverProps {
  src?: string | null;
  onChange?: (src: string) => void;
  editable?: boolean;
}

export default function Cover({ src, onChange, editable = false }: CoverProps) {
  return (
    <EditableImage
      type="cover"
      src={src}
      onChange={onChange || (() => {})}
      editable={editable}
      className="h-36"
    />
  );
}
