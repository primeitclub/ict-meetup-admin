import type { ReactNode } from "react";
import { Tooltip as RadixTooltip } from "radix-ui";

interface TooltipProps {
  /** The hover text (or node) to show. */
  content: ReactNode;
  /** The element that triggers the tooltip. */
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Themed tooltip wrapper around Radix Tooltip. Requires a single
 * <RadixTooltip.Provider> mounted near the app root (see AppProvider).
 */
export default function Tooltip({
  content,
  children,
  side = "top",
}: Readonly<TooltipProps>) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 select-none rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-foreground shadow-md data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0"
        >
          {content}
          <RadixTooltip.Arrow className="fill-surface-2" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
