import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as Popover from "@radix-ui/react-popover";
import { Clock } from "lucide-react";
import FieldLabel from "../FieldLabel";
import { cn } from "../../../shared/utils/cn";

interface TimeRangePickerProps {
  label?: string;
  startTime?: Date | null;
  endTime?: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  startLabel?: string;
  endLabel?: string;
  error?: string;
  isRequired?: boolean;
  placeholder?: string;
  /** Minutes between selectable times. @default 15 */
  timeIntervals?: number;
}

function fmt(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDisplayText(
  start: Date | null | undefined,
  end: Date | null | undefined,
): string {
  if (!start) return "";
  if (end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt(start);
}

export default function TimeRangePicker({
  label,
  startTime,
  endTime,
  onChange,
  startLabel = "Start",
  endLabel = "End",
  error,
  isRequired,
  placeholder = "Select time range",
  timeIntervals = 15,
}: Readonly<TimeRangePickerProps>) {
  const [open, setOpen] = useState(false);

  const displayText = getDisplayText(startTime, endTime);

  const endOfDay = startTime ? new Date(startTime) : null;
  endOfDay?.setHours(23, 45, 0, 0);

  return (
    <div className="w-full">
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
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
              className={
                displayText ? "text-foreground" : "text-muted-foreground"
              }
            >
              {displayText || placeholder}
            </span>
            <Clock size={18} className="text-muted-foreground shrink-0" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 rounded-lg border border-border bg-surface shadow-lg p-3"
          >
            <div className="flex gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {startLabel}
                </p>
                <DatePicker
                  selected={startTime ?? null}
                  onChange={(time: Date | null) =>
                    onChange(time, endTime ?? null)
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={timeIntervals}
                  timeCaption={startLabel}
                  dateFormat="h:mm aa"
                  inline
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {endLabel}
                </p>
                <DatePicker
                  selected={endTime ?? null}
                  onChange={(time: Date | null) =>
                    onChange(startTime ?? null, time)
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={timeIntervals}
                  timeCaption={endLabel}
                  dateFormat="h:mm aa"
                  minTime={startTime ?? undefined}
                  maxTime={endOfDay ?? undefined}
                  inline
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs px-3 py-1.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                Done
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
