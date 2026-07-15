import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Plus, Search, X } from "lucide-react";
import FieldLabel from "../FieldLabel";
import { cn } from "../../../shared/utils/cn";
import type { ComboBoxAction, ComboBoxOption } from "./ComboBox";

interface MultiComboBoxProps {
  label?: string;
  options: ComboBoxOption[];
  value?: string[];
  onChange: (value: string[]) => void;
  action?: ComboBoxAction;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  isRequired?: boolean;
  disabled?: boolean;
  /** Caps how many options can be selected at once. */
  max?: number;
}

/**
 * Multi-select sibling of ComboBox. Selected options render as removable chips in
 * the trigger; the popover stays open across selections so several can be picked
 * in a row.
 */
export default function MultiComboBox({
  label,
  options,
  value,
  onChange,
  action,
  placeholder = "Select options",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  error,
  isRequired,
  disabled,
  max,
}: Readonly<MultiComboBoxProps>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedValues = useMemo(() => value ?? [], [value]);

  const selected = useMemo(
    () =>
      selectedValues
        .map((v) => options.find((opt) => opt.value === v))
        .filter((opt): opt is ComboBoxOption => Boolean(opt)),
    [options, selectedValues],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  const atLimit = max !== undefined && selectedValues.length >= max;

  const toggle = (next: string) => {
    if (selectedValues.includes(next)) {
      onChange(selectedValues.filter((v) => v !== next));
      return;
    }
    if (atLimit) return;
    onChange([...selectedValues, next]);
  };

  const remove = (next: string) => onChange(selectedValues.filter((v) => v !== next));

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
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="flex flex-wrap items-center gap-1.5">
                {selected.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-xs text-foreground"
                  >
                    {opt.label}
                    <X
                      size={12}
                      role="button"
                      aria-label={`Remove ${opt.label}`}
                      className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(opt.value);
                      }}
                    />
                  </span>
                ))}
              </span>
            )}
            <ChevronsUpDown size={16} className="text-muted-foreground shrink-0" />
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
                <p className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</p>
              ) : (
                filtered.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  const isDisabled = !isSelected && atLimit;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm",
                        "hover:bg-surface-2 transition-colors",
                        "disabled:cursor-not-allowed disabled:opacity-40",
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

            {max !== undefined && (
              <p className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
                {selectedValues.length} of {max} selected
              </p>
            )}

            {/* Pinned action — e.g. "Add speaker" */}
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
