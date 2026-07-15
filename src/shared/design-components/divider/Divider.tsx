import type { ReactNode } from "react";
import { Separator } from "radix-ui";
import { cn } from "../../utils/cn";

interface DividerProps {
  /** Optional text/node shown inline (horizontal dividers only). */
  label?: ReactNode;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Where the label sits along the line. @default "center" */
  labelAlign?: "left" | "center" | "right";
  /** Applied to the wrapper — set margins/height here (e.g. "my-6"). */
  className?: string;
  /** Applied to the label text. */
  labelClassName?: string;
}

const line = "bg-border";

/**
 * Themed content divider. Three shapes:
 *   <Divider />                     → plain horizontal rule
 *   <Divider label="Logo" />        → labelled section break
 *   <Divider orientation="vertical" /> → vertical rule (needs a sized parent)
 */
export default function Divider({
  label,
  orientation = "horizontal",
  labelAlign = "center",
  className,
  labelClassName,
}: Readonly<DividerProps>) {
  if (orientation === "vertical") {
    return (
      <Separator.Root
        orientation="vertical"
        decorative
        className={cn("w-px self-stretch", line, className)}
      />
    );
  }

  // Plain horizontal rule — use the real Separator for semantics.
  if (!label) {
    return (
      <Separator.Root
        orientation="horizontal"
        decorative
        className={cn("h-px w-full", line, className)}
      />
    );
  }

  // Labelled divider: lines on either side of the label. The left/right
  // segments flex to push the label to the requested alignment.
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("flex items-center gap-3", className)}
    >
      {labelAlign !== "left" && <span className={cn("h-px flex-1", line)} />}
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wider text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
      </span>
      {labelAlign !== "right" && <span className={cn("h-px flex-1", line)} />}
    </div>
  );
}
