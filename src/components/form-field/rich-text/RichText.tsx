import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { Placeholder } from "@tiptap/extensions";
import { Bold as BoldIcon, Italic as ItalicIcon } from "lucide-react";
import FieldLabel from "../FieldLabel";
import { cn } from "../../../shared/utils/cn";

interface RichTextProps {
  name?: string;
  label?: string;
  /** HTML string. */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
}

// Bold and italic only — the schema itself excludes every other mark/node.
const extensions = [Document, Paragraph, Text, Bold, Italic];

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      // Keep focus in the editor so the toggle applies to the selection.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground",
        active && "bg-accent/15 text-accent",
      )}
    >
      {children}
    </button>
  );
}

export default function RichText({
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  isRequired,
  error,
}: Readonly<RichTextProps>) {
  const editor = useEditor({
    extensions: [...extensions, Placeholder.configure({ placeholder })],
    content: value || "",
    onUpdate: ({ editor }: { editor: Editor }) => {
      // Store "" when visually empty so `required` validation still fires.
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] w-full px-3 py-2 text-sm leading-relaxed focus:outline-none [&_strong]:font-semibold [&_em]:italic",
      },
    },
  });

  // Sync externally-changed values (e.g. async load on edit) into the editor.
  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    if (next === editor.getHTML()) return;
    if (!next && editor.isEmpty) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  return (
    <div>
      {label && <FieldLabel isRequired={isRequired}>{label}</FieldLabel>}

      <div
        className={cn(
          "rounded-lg border bg-background transition-colors focus-within:border-accent",
          error ? "border-red-500" : "border-border",
        )}
      >
        <div className="flex items-center gap-1 border-b border-border px-2 py-1">
          <ToolbarButton
            label="Bold"
            active={!!editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <BoldIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={!!editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon size={16} />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor as Editor} id={name} />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
