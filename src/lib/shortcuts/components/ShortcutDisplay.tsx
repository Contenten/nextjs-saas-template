import React from "react";
import { KeyCombo } from "../types";
import ShortcutManager from "../shortcut-manager";

interface ShortcutDisplayProps {
  shortcutId?: string;
  keyCombo?: KeyCombo;
  className?: string;
}

export const ShortcutDisplay: React.FC<ShortcutDisplayProps> = ({
  shortcutId,
  keyCombo,
  className,
}) => {
  const shortcutManager = React.useMemo(() => new ShortcutManager(), []);

  let displayText = "";

  if (shortcutId) {
    displayText = shortcutManager.getShortcutDisplayString(shortcutId);
  } else if (keyCombo) {
    displayText = shortcutManager.getDisplayString(keyCombo);
  }

  if (!displayText) return null;

  return (
    <span className={`shortcut-display ${className || ""}`}>{displayText}</span>
  );
};
