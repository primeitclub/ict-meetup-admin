import { useController } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import MultiComboBox from "./MultiComboBox";
import type { ComboBoxAction, ComboBoxOption } from "./ComboBox";

interface FormMultiComboBoxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: ComboBoxOption[];
  label?: string;
  action?: ComboBoxAction;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  error?: string;
  isRequired?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  max?: number;
}

export default function FormMultiComboBox<T extends FieldValues>({
  control,
  name,
  options,
  label,
  action,
  rules,
  error,
  isRequired,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  max,
}: Readonly<FormMultiComboBoxProps<T>>) {
  const { field } = useController({ control, name, rules });
  const required = isRequired ?? Boolean(rules?.required);

  return (
    <MultiComboBox
      label={label}
      options={options}
      value={field.value ?? []}
      onChange={field.onChange}
      action={action}
      error={error}
      isRequired={required}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      disabled={disabled}
      max={max}
    />
  );
}
