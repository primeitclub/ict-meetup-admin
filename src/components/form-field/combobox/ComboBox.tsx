import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import FieldLabel from "../FieldLabel";
import { cn } from "../../../shared/utils/cn";

export interface ComboBoxOption {
  label: string;
  value: string;
}

/**
 * An action row pinned to the bottom of the option list — e.g. "Add category".
 * Clicking it runs `onSelect` (which can open a modal) and closes the popover.
 */
export interface ComboBoxAction {
  label: string;
  onSelect: () => void;
}

interface ComboBoxProps {
  label?: string;
  options: ComboBoxOption[];
  value?: string;
  onChange: (value: string) => void;
  action?: ComboBoxAction;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  isRequired?: boolean;
  disabled?: boolean;
}

export default function ComboBox({
  label,
  options,
  value,
  onChange,
  action,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  error,
  isRequired,
  disabled,
}: Readonly<ComboBoxProps>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((opt) => opt.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (next: string) => {
    onChange(next);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="w-full">
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full bg-background border rounded-lg p-2.5 text-sm text-left",
              "flex items-center justify-between gap-2",
              "hover:border-muted-foreground focus:border-accent outline-none transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-red-500" : "border-border",
            )}
          >
            <span
              className={
                selected ? "text-foreground" : "text-muted-foreground"
              }
            >
              {selected?.label ?? placeholder}
            </span>
            <ChevronsUpDown
              size={16}
              className="text-muted-foreground shrink-0"
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-border bg-surface shadow-lg overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            {/* Options */}
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  {emptyText}
                </p>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm",
                        "hover:bg-surface-2 transition-colors",
                        isSelected ? "text-accent" : "text-foreground",
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Pinned action — e.g. "Add category" */}
            {action && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onSelect();
                }}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm font-medium text-accent hover:bg-surface-2 transition-colors"
              >
                <Plus size={14} className="shrink-0" />
                <span>{action.label}</span>
              </button>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
