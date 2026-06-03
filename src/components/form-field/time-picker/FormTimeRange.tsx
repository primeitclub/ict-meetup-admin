import { useMemo } from "react";
import { useController } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import TimeRangePicker from "./TimeRangePicker";

/** Parse a stored "HH:mm" or "HH:mm:ss" string into a Date (falls back to Date-parseable values). */
function parseTime(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (match) {
    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return date;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Format a Date as a 24-hour "HH:mm" string for storage. */
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

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
  // picker doesn't reset its internal state on every render. Values are stored
  // as 24-hour "HH:mm" strings (the format the events API expects).
  const startTime = useMemo(() => parseTime(startField.value), [startField.value]);
  const endTime = useMemo(() => parseTime(endField.value), [endField.value]);

  const handleChange = (start: Date | null, end: Date | null) => {
    startField.onChange(start ? formatTime(start) : "");
    endField.onChange(end ? formatTime(end) : "");
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
