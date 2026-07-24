import MarkdownEditor from "@uiw/react-markdown-editor";
import { EditorView } from "@codemirror/view";
import FieldLabel from "../FieldLabel";
import { useThemeStore } from "../../../store/theme.store";
import { cn } from "../../../shared/utils/cn";

interface MarkdownFieldProps {
  name?: string;
  label?: string;
  /** Markdown source string. */
  value: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
}

/**
 * Markdown editor field (bundles a live preview). The value is the raw
 * markdown source — loads existing markdown on edit and emits the edited
 * source on change. `data-color-mode` follows the admin light/dark theme so
 * the editor + preview match the surrounding UI.
 */
export default function MarkdownField({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  isRequired,
  error,
}: Readonly<MarkdownFieldProps>) {
  const theme = useThemeStore((s) => s.theme);

  return (
    <div>
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}

      <div
        data-color-mode={theme}
        className={cn(
          "overflow-hidden rounded-lg border transition-colors focus-within:border-accent",
          error ? "border-red-500" : "border-border",
        )}
      >
        <MarkdownEditor
          value={value}
          height="240px"
          // Wrap long lines to the editor width instead of letting the text
          // grow the editor (and container) horizontally.
          extensions={[EditorView.lineWrapping]}
          placeholder={placeholder}
          // Store "" when visually empty so `required` validation still fires.
          onChange={(next) => onChange(next.trim() === "" ? "" : next)}
          onBlur={onBlur}
          aria-label={label ?? name}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
