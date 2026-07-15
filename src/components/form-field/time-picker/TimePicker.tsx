import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Clock } from "lucide-react";
import FieldLabel from "../FieldLabel";

interface TimePickerProps {
  label: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholderText?: string;
  isRequired?: boolean;
  /** Minutes between selectable times. @default 15 */
  timeIntervals?: number;
  /** Earliest selectable time. react-datepicker needs maxTime set too. */
  minTime?: Date | null;
  /** Latest selectable time. */
  maxTime?: Date | null;
}

const TimePicker = ({
  label,
  selected,
  onChange,
  error,
  placeholderText = "Select time",
  isRequired,
  timeIntervals = 15,
  minTime,
  maxTime,
}: TimePickerProps) => {
  return (
    <div className="w-full">
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
      <div className="relative group w-full">
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholderText}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={timeIntervals}
          timeCaption="Time"
          dateFormat="h:mm aa"
          autoComplete="off"
          popperPlacement="bottom-start"
          minTime={minTime ?? undefined}
          maxTime={maxTime ?? undefined}
          className={`w-full bg-background border ${
            error ? "border-red-500" : "border-border"
          } rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground text-sm focus:border-accent hover:border-muted-foreground outline-none transition-all duration-200 pr-10 cursor-pointer`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-accent transition-colors duration-200 pointer-events-none">
          <Clock size={18} />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TimePicker;
