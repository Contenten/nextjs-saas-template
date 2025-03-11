import { useEffect } from "react";
import ShortcutManager from "../shortcut-manager";
import { ShortcutAction } from "../types";

// Singleton instance for the application
const globalShortcutManager = new ShortcutManager();

export function useShortcut(shortcut: ShortcutAction) {
  useEffect(() => {
    globalShortcutManager.registerShortcut(shortcut);

    return () => {
      globalShortcutManager.unregisterShortcut(shortcut.id);
    };
  }, [shortcut]);
}

export function useShortcutGroup(
  groupId: string,
  name: string,
  shortcuts: ShortcutAction[],
) {
  useEffect(() => {
    globalShortcutManager.registerGroup({
      id: groupId,
      name,
      shortcuts,
    });

    // No cleanup needed as the ShortcutManager handles this
  }, [groupId, name, shortcuts]);
}

export function useShortcutContext(contextId: string) {
  useEffect(() => {
    globalShortcutManager.activateContext(contextId);

    return () => {
      globalShortcutManager.deactivateContext(contextId);
    };
  }, [contextId]);
}

// Initialize the shortcut manager
if (typeof window !== "undefined") {
  globalShortcutManager.enable();
}

export { globalShortcutManager };
