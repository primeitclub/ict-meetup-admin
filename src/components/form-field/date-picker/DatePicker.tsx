import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import type { MiddlewareReturn, MiddlewareState } from "@floating-ui/dom";
import FieldLabel from "../FieldLabel";

interface DatePickerProps {
  label: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholderText?: string;
  isRequired?: boolean;
  /** Earliest selectable date (passed through to react-datepicker). */
  minDate?: Date | null;
  /** Latest selectable date (passed through to react-datepicker). */
  maxDate?: Date | null;
}

const DatePicker = ({
  label,
  selected,
  onChange,
  error,
  placeholderText = "Select date",
  isRequired,
  minDate,
  maxDate,
}: DatePickerProps) => {
  return (
    <div className="w-full">
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
      <div className="relative group w-full">
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholderText}
          minDate={minDate ?? undefined}
          maxDate={maxDate ?? undefined}
          className={`w-full bg-background border ${
            error ? "border-red-500" : "border-border"
          } rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground text-sm focus:border-accent hover:border-muted-foreground outline-none transition-all duration-200 pr-10 cursor-pointer`}
          dateFormat="yyyy-MM-dd"
          autoComplete="off"
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
              fn: function (
                _state: MiddlewareState,
              ): MiddlewareReturn | Promise<MiddlewareReturn> {
                throw new Error("Function not implemented.");
              },
            },
          ]}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-accent transition-colors duration-200 pointer-events-none">
          <Calendar size={18} />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker;
