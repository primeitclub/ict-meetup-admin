import { useMemo } from "react";
import { useController } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import TimeRangePicker from "./TimeRangePicker";

interface FormTimeRangeProps<T extends FieldValues> {
  control: Control<T>;
  startName: Path<T>;
  endName: Path<T>;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  error?: string;
  isRequired?: boolean;
}

export default function FormTimeRange<T extends FieldValues>({
  control,
  startName,
  endName,
  label,
  startLabel,
  endLabel,
  rules,
  error,
  isRequired,
}: Readonly<FormTimeRangeProps<T>>) {
  const { field: startField } = useController({
    control,
    name: startName,
    rules,
  });
  const { field: endField } = useController({ control, name: endName });

  const required = isRequired ?? Boolean(rules?.required);

  // Stable Date references while the underlying value is unchanged, so the
  // picker doesn't reset its internal state on every render.
  const startTime = useMemo(
    () => (startField.value ? new Date(startField.value) : null),
    [startField.value],
  );
  const endTime = useMemo(
    () => (endField.value ? new Date(endField.value) : null),
    [endField.value],
  );

  const handleChange = (start: Date | null, end: Date | null) => {
    startField.onChange(start ? start.toISOString() : "");
    endField.onChange(end ? end.toISOString() : "");
  };

  return (
    <TimeRangePicker
      label={label}
      startLabel={startLabel}
      endLabel={endLabel}
      startTime={startTime}
      endTime={endTime}
      onChange={handleChange}
      error={error}
      isRequired={required}
    />
  );
}
