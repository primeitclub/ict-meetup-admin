import { forwardRef, type InputHTMLAttributes } from "react";
import FieldLabel from "../FieldLabel";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  isRequired?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, isRequired, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <FieldLabel htmlFor={props.name} isRequired={isRequired}>
            {label}
          </FieldLabel>
        )}
        <input
          ref={ref}
          id={props.name}
          className={`w-full bg-background border ${
            error ? "border-red-500" : "border-border"
          } rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground text-sm focus:border-accent outline-none transition-colors ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
export default Input;
