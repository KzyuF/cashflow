import { create } from "zustand";

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modal: string | null;
  setModal: (modal: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  modal: null,
  setModal: (modal) => set({ modal }),
}));
