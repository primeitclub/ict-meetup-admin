import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import TimePicker from "./TimePicker";

interface FormTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  error?: string;
  placeholderText?: string;
  /** Show a required asterisk. Defaults to whether `rules.required` is set. */
  isRequired?: boolean;
}

/**
 * RHF-bound time picker. The form value is stored as a full ISO date-time
 * string (`Date.toISOString()`) since the API expects `string($date-time)`.
 */
const FormTimePicker = <T extends FieldValues>({
  control,
  name,
  label,
  rules,
  error,
  placeholderText,
  isRequired,
}: FormTimePickerProps<T>) => {
  const required = isRequired ?? Boolean(rules?.required);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <TimePicker
          label={label}
          isRequired={required}
          selected={field.value ? new Date(field.value) : null}
          onChange={(date) => field.onChange(date ? date.toISOString() : "")}
          error={error}
          placeholderText={placeholderText}
        />
      )}
    />
  );
};

export default FormTimePicker;
