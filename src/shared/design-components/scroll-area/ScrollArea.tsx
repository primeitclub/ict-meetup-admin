import type { ReactNode } from "react";
import { ScrollArea as RadixScrollArea } from "radix-ui";
import { cn } from "../../utils/cn";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "both";
  type?: "auto" | "always" | "scroll" | "hover";
}

const scrollbar =
  "flex touch-none select-none bg-transparent p-0.5 transition-colors duration-150";
const thumb =
  "relative flex-1 rounded-full bg-foreground/20 hover:bg-foreground/30";

export default function ScrollArea({
  children,
  className,
  orientation = "vertical",
  type = "hover",
}: Readonly<ScrollAreaProps>) {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <RadixScrollArea.Root
      type={type}
      className={cn("overflow-hidden", className)}
    >
      <RadixScrollArea.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </RadixScrollArea.Viewport>

      {showVertical && (
        <RadixScrollArea.Scrollbar
          orientation="vertical"
          className={cn(scrollbar, "w-2.5")}
        >
          <RadixScrollArea.Thumb className={thumb} />
        </RadixScrollArea.Scrollbar>
      )}
      {showHorizontal && (
        <RadixScrollArea.Scrollbar
          orientation="horizontal"
          className={cn(scrollbar, "h-2.5 flex-col")}
        >
          <RadixScrollArea.Thumb className={thumb} />
        </RadixScrollArea.Scrollbar>
      )}
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  );
}
