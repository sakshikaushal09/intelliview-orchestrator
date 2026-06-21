/**
 * Lightweight global store for sidebar/mobile-menu state.
 */
import { create } from "zustand";

interface UIState {
  mobileSidebarOpen: boolean;
  setMobileSidebar: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileSidebarOpen: false,
  setMobileSidebar: (open) => set({ mobileSidebarOpen: open }),
}));
