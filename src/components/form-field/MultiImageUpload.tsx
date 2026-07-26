import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import FieldLabel from "./FieldLabel";
import { isImageSizeValid, imageSizeErrorMessage } from "../../utils/fileValidation";

export interface ImagePreview {
  /** Stable key for list rendering and removal. */
  key: string;
  url: string;
}

interface MultiImageUploadProps {
  label?: string;
  isRequired?: boolean;
  accept?: string;
  hint?: string;
  previews: ImagePreview[];
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
  error?: string;
}

/**
 * Multi-image upload with click + drag-and-drop. The parent owns the file and
 * preview state; this component only renders the grid and emits add/remove.
 */
export default function MultiImageUpload({
  label,
  isRequired,
  accept = "image/*",
  hint,
  previews,
  onAdd,
  onRemove,
  error,
}: Readonly<MultiImageUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const acceptFiles = (files: File[]) => {
    const oversized = files.filter((f) => !isImageSizeValid(f));
    const accepted = files.filter((f) => isImageSizeValid(f));

    setSizeError(oversized.length ? imageSizeErrorMessage(oversized[0]) : null);
    if (accepted.length) onAdd(accepted);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length) acceptFiles(files);
    // allow re-picking the same file later
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length) acceptFiles(files);
  };

  const displayError = sizeError || error;

  return (
    <div className="w-full">
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border border-dashed bg-background p-4 transition-colors",
          isDragOver
            ? "border-accent bg-accent/5"
            : displayError
              ? "border-red-500"
              : "border-border",
        )}
      >
        <div className="flex flex-wrap gap-3">
          {previews.map((preview) => (
            <div
              key={preview.key}
              className="relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-surface"
            >
              <img
                src={preview.url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(preview.key)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white transition-colors hover:bg-red-600"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Add tile */}
          <button
            type="button"
            onClick={openPicker}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
          >
            <ImagePlus size={20} />
            <span className="text-xs font-medium">Add</span>
          </button>
        </div>

        {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {displayError && (
        <p className="mt-1 text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
}
