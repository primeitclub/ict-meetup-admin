import { Checkbox } from "radix-ui";
import { Check } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";

interface FormCheckboxProps {
  /** react-hook-form field name. */
  name: string;
  label: string;
  id?: string;
  /** Renders a red asterisk after the label. */
  isRequired?: boolean;
}

/**
 * Radix Checkbox bound to react-hook-form via useController. Must be used
 * inside a <FormProvider> (which the version/hero forms already provide).
 */
export default function FormCheckbox({
  name,
  label,
  id,
  isRequired,
}: Readonly<FormCheckboxProps>) {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const checkboxId = id ?? name;

  return (
    <div className="flex items-center space-x-2">
      <Checkbox.Root
        id={checkboxId}
        ref={field.ref}
        checked={Boolean(field.value)}
        onCheckedChange={(checked) => field.onChange(checked === true)}
        onBlur={field.onBlur}
        className="flex h-5 w-5 items-center justify-center rounded border border-border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <Checkbox.Indicator>
          <Check size={14} className="text-accent-foreground" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        htmlFor={checkboxId}
        className="text-sm text-muted-foreground cursor-pointer"
      >
        {label}
        {isRequired && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
    </div>
  );
}
