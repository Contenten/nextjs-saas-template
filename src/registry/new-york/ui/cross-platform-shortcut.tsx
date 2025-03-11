import React from "react";
import { cn } from "@/lib/utils";
import { KeyCombo } from "@/lib/shortcuts/types";
import { ShortcutDisplay } from "@/lib/shortcuts/components/ShortcutDisplay";

interface CrossPlatformShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  keyCombo?: KeyCombo;
  shortcutId?: string;
}

const CrossPlatformShortcut = ({
  className,
  keyCombo,
  shortcutId,
  ...props
}: CrossPlatformShortcutProps) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    >
      {shortcutId && <ShortcutDisplay shortcutId={shortcutId} />}
      {!shortcutId && keyCombo && <ShortcutDisplay keyCombo={keyCombo} />}
    </span>
  );
};

CrossPlatformShortcut.displayName = "CrossPlatformShortcut";

export { CrossPlatformShortcut };
