import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import FieldLabel from "./FieldLabel";
import { getImageUrl } from "../../utils/imageUtils";
import { isImageSizeValid, imageSizeErrorMessage } from "../../utils/fileValidation";

interface FormFileUploadProps {
  name: string;
  label?: string;
  isRequired?: boolean;
  accept?: string;
  preview?: string | null;
  onFileChange: (file: File | null) => void;
  title?: string;
  hint?: string;
  secondaryAction?: { label: string; onClick: () => void };
  error?: string;
  /** "document" shows a file icon + name instead of rendering `preview` as an <img>. Defaults to "image". */
  previewKind?: "image" | "document";
  /** Custom validation run before a file is accepted; return an error string to reject it. Defaults to the shared image-size check. */
  validate?: (file: File) => string | null;
}

/**
 * Pure (uncontrolled-by-RHF) file upload field with click + drag-and-drop.
 * The parent owns the file/preview state; this component only emits changes.
 */
export default function FormFileUpload({
  name,
  label,
  isRequired,
  accept,
  preview,
  onFileChange,
  title = "Drop your file here",
  hint,
  secondaryAction,
  error,
  previewKind = "image",
  validate = (file) => (isImageSizeValid(file) ? null : imageSizeErrorMessage(file)),
}: Readonly<FormFileUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const acceptFile = (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setSizeError(validationError);
      return;
    }
    setSizeError(null);
    onFileChange(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) acceptFile(file);
    // allow re-picking the same file later
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) acceptFile(file);
  };

  const displayError = sizeError || error;

  return (
    <div className="w-full">
      {label && (
        <FieldLabel htmlFor={name} isRequired={isRequired}>
          {label}
        </FieldLabel>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-4 rounded-lg border border-dashed bg-background p-4 transition-colors",
          isDragOver
            ? "border-accent bg-accent/5"
            : displayError
              ? "border-red-500"
              : "border-border",
        )}
      >
        {/* Left thumbnail / icon slot */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
          {preview ? (
            previewKind === "document" ? (
              <FileText className="text-accent" size={24} />
            ) : (
              <img
                src={getImageUrl(preview)}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <Upload className="text-muted-foreground" size={20} />
          )}
          {preview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSizeError(null);
                onFileChange(null);
              }}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white transition-colors hover:bg-red-600"
              aria-label="Remove file"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Right content + actions */}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {previewKind === "document" && preview && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {preview}
              </p>
            )}
            {hint && (
              <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openPicker}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              {preview ? "Change file" : "Choose file"}
            </button>
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="text-sm font-medium text-accent hover:underline"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          id={name}
          name={name}
          type="file"
          accept={accept}
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
