import { useMemo } from "react";
import { useController } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import DateRangePicker from "./DateRangePicker";
import { parseDate, serializeDate } from "../../../shared/utils/date";

interface FormDateRangeProps<T extends FieldValues> {
  control: Control<T>;
  startName: Path<T>;
  endName: Path<T>;
  label: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  error?: string;
  isRequired?: boolean;
  placeholder?: string;
  withTime?: boolean;
}

export default function FormDateRange<T extends FieldValues>({
  control,
  startName,
  endName,
  label,
  rules,
  error,
  isRequired,
  placeholder,
  withTime = false,
}: Readonly<FormDateRangeProps<T>>) {
  const { field: startField } = useController({
    control,
    name: startName,
    rules,
  });
  const { field: endField } = useController({ control, name: endName });

  const required = isRequired ?? Boolean(rules?.required);

  const startDate = useMemo(
    () => parseDate(startField.value),
    [startField.value],
  );
  const endDate = useMemo(() => parseDate(endField.value), [endField.value]);

  const handleChange = (start: Date | null, end: Date | null) => {
    startField.onChange(start ? serializeDate(start, withTime) : "");
    endField.onChange(end ? serializeDate(end, withTime) : "");
  };

  return (
    <DateRangePicker
      label={label}
      startDate={startDate}
      endDate={endDate}
      onChange={handleChange}
      error={error}
      isRequired={required}
      placeholder={placeholder}
      withTime={withTime}
    />
  );
}
