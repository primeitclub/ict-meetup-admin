import { useMemo } from "react";
import { useController } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import DateRangePicker from "./DateRangePicker";

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

function parseDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  // Parse a date-only "YYYY-MM-DD" string in local time. Passing it straight to
  // `new Date()` would interpret it as UTC midnight, shifting the day backwards
  // in negative-offset timezones (the classic off-by-one). Datetime strings that
  // include a time component are already parsed as local time, so leave those.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function serializeDate(date: Date, withTime: boolean): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (!withTime) return `${y}-${m}-${d}`;
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
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

  // Memoize so the picker receives a stable Date reference while the underlying
  // form value is unchanged. Re-parsing into a fresh Date on every render makes
  // react-datepicker reset its internal pre-selection, which feels jumpy and
  // makes clicks/navigation seem unresponsive.
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
