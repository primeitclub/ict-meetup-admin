import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import FieldLabel from "../FieldLabel";
import { cn } from "../../../shared/utils/cn";

interface DateRangePickerProps {
  label: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  error?: string;
  isRequired?: boolean;
  placeholder?: string;
  withTime?: boolean;
}

function fmt(date: Date, withTime: boolean): string {
  if (withTime) {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDisplayText(
  start: Date | null | undefined,
  end: Date | null | undefined,
  withTime: boolean,
): string {
  if (!start) return "";
  if (end) return `${fmt(start, withTime)} → ${fmt(end, withTime)}`;
  return fmt(start, withTime);
}

export default function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
  error,
  isRequired,
  placeholder = "Select date range",
  withTime = false,
}: Readonly<DateRangePickerProps>) {
  const [open, setOpen] = useState(false);

  const displayText = getDisplayText(startDate, endDate, withTime);

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onChange(start, end);
    // In withTime mode keep the popover open so the user can still adjust the
    // time of either endpoint; the "Done" button closes it. Date-only mode can
    // close as soon as both ends are picked.
    if (!withTime && start && end) setOpen(false);
  };

  return (
    <div className="w-full">
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "w-full bg-background border rounded-lg p-2.5 text-sm text-left",
              "flex items-center justify-between gap-2",
              "hover:border-muted-foreground focus:border-accent outline-none transition-all duration-200",
              error ? "border-red-500" : "border-border",
            )}
          >
            <span
              className={displayText ? "text-foreground" : "text-muted-foreground"}
            >
              {displayText || placeholder}
            </span>
            <Calendar size={18} className="text-muted-foreground shrink-0" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 rounded-lg border border-border bg-surface shadow-lg p-3"
          >
            <DatePicker
              selectsRange
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              onChange={handleRangeChange}
              showTimeSelect={withTime}
              timeIntervals={15}
              timeFormat="h:mm aa"
              dateFormat={withTime ? "MMM d, yyyy h:mm aa" : "MMM d, yyyy"}
              inline
            />

            {withTime && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs px-3 py-1.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
