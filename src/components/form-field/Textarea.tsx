import { forwardRef, type TextareaHTMLAttributes } from "react";
import FieldLabel from "./FieldLabel";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  isRequired?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, isRequired, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
        <textarea
          ref={ref}
          className={`w-full bg-background border ${
            error ? "border-red-500" : "border-border"
          } rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground text-sm focus:border-accent outline-none transition-colors min-h-[120px] resize-y ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
export default Textarea;
