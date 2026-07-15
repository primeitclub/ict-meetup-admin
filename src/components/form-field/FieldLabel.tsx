import type { ReactNode } from "react";
import { cn } from "../../shared/utils/cn";

interface FieldLabelProps {
  htmlFor?: string;
  children: ReactNode;
  /** Renders a red asterisk after the label text. */
  isRequired?: boolean;
  className?: string;
}

/** Shared form-field label with an optional required asterisk. */
export default function FieldLabel({
  htmlFor,
  children,
  isRequired,
  className,
}: Readonly<FieldLabelProps>) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1 block text-sm font-medium text-foreground",
        className,
      )}
    >
      {children}
      {isRequired && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
