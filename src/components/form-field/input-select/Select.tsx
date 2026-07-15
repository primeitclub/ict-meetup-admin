import ReactSelect, { type Props as ReactSelectProps } from "react-select";
import FieldLabel from "../FieldLabel";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends ReactSelectProps<SelectOption, false> {
  label?: string;
  error?: string;
  isRequired?: boolean;
}

// react-select takes a JS style object, so we can't use Tailwind classes.
// CSS custom properties DO resolve in inline styles, so we reference the same
// theme tokens via rgb(var(--token)) — these flip with light/dark.
const selectStyles: ReactSelectProps<SelectOption, false>["styles"] = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgb(var(--background))",
    borderColor: state.isFocused ? "rgb(var(--accent))" : "rgb(var(--border))",
    borderRadius: "0.5rem",
    padding: "1px 2px",
    boxShadow: "none",
    "&:hover": {
      borderColor: state.isFocused
        ? "rgb(var(--accent))"
        : "rgb(var(--muted-foreground))",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "rgb(var(--surface))",
    border: "1px solid rgb(var(--border))",
    borderRadius: "0.5rem",
    overflow: "hidden",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgb(var(--accent))"
      : state.isFocused
        ? "rgb(var(--surface-2))"
        : "transparent",
    color: state.isSelected
      ? "rgb(var(--accent-foreground))"
      : "rgb(var(--foreground))",
    fontSize: "0.875rem",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "rgb(var(--foreground))",
    fontSize: "0.875rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgb(var(--muted-foreground))",
    fontSize: "0.875rem",
  }),
  input: (base) => ({ ...base, color: "rgb(var(--foreground))" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "rgb(var(--muted-foreground))",
  }),
};

const Select = ({ label, error, isRequired, ...props }: SelectProps) => {
  return (
    <div className="w-full">
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <ReactSelect styles={selectStyles} classNamePrefix="rs" {...props} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
