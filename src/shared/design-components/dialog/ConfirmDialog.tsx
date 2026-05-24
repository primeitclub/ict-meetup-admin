import type { ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { cn } from "../../utils/cn";

interface ConfirmDialogProps {
  /** Controlled open state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Called when the user confirms. Close the dialog from the parent. */
  onConfirm: () => void;
  /** "danger" styles the confirm button as destructive. */
  variant?: "danger" | "default";
  /** Disables the confirm button + shows a spinner while an async op runs. */
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
  isLoading = false,
}: Readonly<ConfirmDialogProps>) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <AlertDialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl focus:outline-none"
        >
          <AlertDialog.Title className="text-lg font-semibold text-foreground">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  // Let the parent decide when to close (e.g. after the
                  // mutation settles) by handling onConfirm itself.
                  e.preventDefault();
                  onConfirm();
                }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground",
                )}
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
