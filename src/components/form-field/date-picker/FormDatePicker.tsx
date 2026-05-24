import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import DatePicker from "./DatePicker";

interface FormDatePickerProps<T extends FieldValues> {
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
  /** Earliest selectable date. */
  minDate?: Date | null;
  /** Latest selectable date. */
  maxDate?: Date | null;
}

const FormDatePicker = <T extends FieldValues>({
  control,
  name,
  label,
  rules,
  error,
  placeholderText,
  isRequired,
  minDate,
  maxDate,
}: FormDatePickerProps<T>) => {
  const required = isRequired ?? Boolean(rules?.required);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <DatePicker
          label={label}
          isRequired={required}
          selected={field.value ? new Date(field.value) : null}
          onChange={(date) => {
            if (date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              field.onChange(`${year}-${month}-${day}`);
            } else {
              field.onChange("");
            }
          }}
          error={error}
          placeholderText={placeholderText}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    />
  );
};

export default FormDatePicker;
