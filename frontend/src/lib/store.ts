/**
 * Lightweight global store for the API token and UI preferences.
 * Uses Zustand for a tiny, ergonomic store.
 */
import { create } from "zustand";
import { api } from "./api";

interface AppState {
  token: string | null;
  hasHydrated: boolean;
  setToken: (token: string | null) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: null,
  hasHydrated: false,
  setToken: (token) => {
    api.setToken(token);
    set({ token });
  },
  hydrate: () => {
    const t = api.loadToken();
    set({ token: t, hasHydrated: true });
  },
}));
