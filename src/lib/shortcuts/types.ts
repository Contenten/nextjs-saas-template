export type Modifier = "ctrl" | "shift" | "alt" | "meta";
export type Key = string; // 'a', 'b', '1', 'ArrowUp', 'Escape', etc.

export interface KeyCombo {
  key: Key;
  modifiers?: Modifier[];
}

export interface ShortcutAction {
  id: string;
  description: string;
  // Support for sequence of key combinations (e.g., Ctrl+K followed by Ctrl+S)
  keyCombos: KeyCombo[];
  // Callback for when shortcut is triggered
  handler: () => void;
  // Optional context where this shortcut is active
  context?: string;
  // When true, prevents default behavior
  preventDefault?: boolean;
  // When true, stops event propagation
  stopPropagation?: boolean;
}

export interface ShortcutGroup {
  id: string;
  name: string;
  description?: string;
  shortcuts: ShortcutAction[];
}

export interface ShortcutDisplayConfig {
  // How to display modifiers on different platforms
  modifierSymbols: {
    meta: { mac: string; windows: string; linux: string };
    ctrl: { mac: string; windows: string; linux: string };
    alt: { mac: string; windows: string; linux: string };
    shift: { mac: string; windows: string; linux: string };
  };
}
