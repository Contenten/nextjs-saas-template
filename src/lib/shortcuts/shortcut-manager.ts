import {
  KeyCombo,
  Modifier,
  ShortcutAction,
  ShortcutGroup,
  ShortcutDisplayConfig,
} from "./types";

const DEFAULT_DISPLAY_CONFIG: ShortcutDisplayConfig = {
  modifierSymbols: {
    meta: { mac: "⌘", windows: "Win", linux: "Super" },
    ctrl: { mac: "⌃", windows: "Ctrl", linux: "Ctrl" },
    alt: { mac: "⌥", windows: "Alt", linux: "Alt" },
    shift: { mac: "⇧", windows: "Shift", linux: "Shift" },
  },
};

class ShortcutManager {
  private shortcuts: Map<string, ShortcutAction> = new Map();
  private groups: Map<string, ShortcutGroup> = new Map();
  private activeContexts: Set<string> = new Set(["global"]);
  private keySequence: string[] = [];
  private sequenceTimer: NodeJS.Timeout | null = null;
  private displayConfig: ShortcutDisplayConfig;
  private platform: "mac" | "windows" | "linux";

  constructor(config?: Partial<ShortcutDisplayConfig>) {
    this.displayConfig = { ...DEFAULT_DISPLAY_CONFIG, ...config };

    // Detect platform
    this.platform = navigator.platform.includes("Mac")
      ? "mac"
      : navigator.platform.includes("Win")
        ? "windows"
        : "linux";

    // Bind event listener
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Start listening for keyboard shortcuts
   */
  public enable(): void {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Stop listening for keyboard shortcuts
   */
  public disable(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Register a new shortcut
   */
  public registerShortcut(shortcut: ShortcutAction): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  /**
   * Register multiple shortcuts
   */
  public registerShortcuts(shortcuts: ShortcutAction[]): void {
    shortcuts.forEach((shortcut) => this.registerShortcut(shortcut));
  }

  /**
   * Register a group of shortcuts
   */
  public registerGroup(group: ShortcutGroup): void {
    this.groups.set(group.id, group);
    group.shortcuts.forEach((shortcut) => this.registerShortcut(shortcut));
  }

  /**
   * Unregister a shortcut by ID
   */
  public unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);

    // Also remove from any groups
    this.groups.forEach((group) => {
      group.shortcuts = group.shortcuts.filter((s) => s.id !== id);
    });
  }

  /**
   * Activate a context
   */
  public activateContext(contextId: string): void {
    this.activeContexts.add(contextId);
  }

  /**
   * Deactivate a context
   */
  public deactivateContext(contextId: string): void {
    if (contextId !== "global") {
      this.activeContexts.delete(contextId);
    }
  }

  /**
   * Get a formatted string representation of a key combo for display
   */
  public getDisplayString(keyCombo: KeyCombo): string {
    const { key, modifiers = [] } = keyCombo;

    const modifierSymbols = modifiers.map((mod) => {
      return this.displayConfig.modifierSymbols[mod][this.platform];
    });

    // Handle special keys
    const displayKey = key.length === 1 ? key.toUpperCase() : key;

    return [...modifierSymbols, displayKey].join("");
  }

  /**
   * Get a formatted string representation of a shortcut for display
   */
  public getShortcutDisplayString(shortcutId: string): string {
    const shortcut = this.shortcuts.get(shortcutId);
    if (!shortcut) return "";

    return shortcut.keyCombos
      .map((combo) => this.getDisplayString(combo))
      .join(" ");
  }

  /**
   * Internal handler for keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore key presses in editable elements
    if (
      (event.target instanceof HTMLElement && event.target.isContentEditable) ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Extract event information
    const key = event.key;
    const modifiers: Modifier[] = [];

    if (event.ctrlKey) modifiers.push("ctrl");
    if (event.shiftKey) modifiers.push("shift");
    if (event.altKey) modifiers.push("alt");
    if (event.metaKey) modifiers.push("meta");

    // Skip standalone modifier key presses
    if (["Control", "Shift", "Alt", "Meta"].includes(key)) {
      return;
    }

    // Create a string representation of this key press
    const keyString = this.createKeyString(key, modifiers);

    // Reset sequence if this is a new sequence with modifiers
    // This helps prevent the issue where pressing cmd+b registers as two separate presses
    if (modifiers.length > 0 && this.keySequence.length === 0) {
      this.keySequence = [keyString];
    } else {
      // Add to the current sequence
      this.keySequence.push(keyString);
    }

    // Reset the sequence after a delay
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
    }

    this.sequenceTimer = setTimeout(() => {
      this.keySequence = [];
    }, 1000); // 1 second timeout for multi-key sequences

    // Check if this matches any registered shortcuts
    for (const shortcut of this.shortcuts.values()) {
      // Skip shortcuts for inactive contexts
      if (shortcut.context && !this.activeContexts.has(shortcut.context)) {
        continue;
      }

      // Check if the current sequence matches the shortcut
      if (this.sequenceMatches(this.keySequence, shortcut.keyCombos)) {
        // Prevent default behavior if specified
        if (shortcut.preventDefault) {
          event.preventDefault();
        }

        // Stop propagation if specified
        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }

        // Call the handler
        shortcut.handler();

        // Reset the sequence
        this.keySequence = [];
        if (this.sequenceTimer) {
          clearTimeout(this.sequenceTimer);
          this.sequenceTimer = null;
        }

        break;
      }
    }
  }

  /**
   * Create a string representation of a key press
   */
  private createKeyString(key: string, modifiers: Modifier[]): string {
    // Normalize the key to handle key differences across browsers
    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;

    const sortedModifiers = [...modifiers].sort();
    return [...sortedModifiers, normalizedKey].join("+");
  }

  /**
   * Check if a sequence of keys matches a shortcut
   */
  private sequenceMatches(sequence: string[], keyCombos: KeyCombo[]): boolean {
    // Special case for single key combination shortcuts (most common case)
    if (keyCombos.length === 1 && sequence.length >= 1) {
      const lastKeyPress = sequence[sequence.length - 1];
      const targetCombo = keyCombos[0];

      if (!targetCombo) return false;

      const targetModifiers = targetCombo.modifiers || [];
      const targetKey =
        typeof targetCombo.key === "string" && targetCombo.key.length === 1
          ? targetCombo.key.toLowerCase()
          : targetCombo.key;

      const targetString = this.createKeyString(targetKey, targetModifiers);

      return lastKeyPress === targetString;
    }

    // For multi-key sequences
    if (sequence.length !== keyCombos.length) {
      return false;
    }

    for (let i = 0; i < sequence.length; i++) {
      const current = sequence[i];
      const target = keyCombos[i];

      if (!target) return false;

      const targetModifiers = target.modifiers || [];
      const targetKey =
        typeof target.key === "string" && target.key.length === 1
          ? target.key.toLowerCase()
          : target.key;

      const targetString = this.createKeyString(targetKey, targetModifiers);

      if (current !== targetString) {
        return false;
      }
    }

    return true;
  }
}

export default ShortcutManager;
