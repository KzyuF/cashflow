import { create } from "zustand";

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modal: string | null;
  setModal: (modal: string | null) => void;
  userCurrency: string;
  setUserCurrency: (currency: string) => void;
  userLanguage: string;
  setUserLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  modal: null,
  setModal: (modal) => set({ modal }),
  userCurrency: "EUR",
  setUserCurrency: (currency) => set({ userCurrency: currency }),
  userLanguage: "ru",
  setUserLanguage: (language) => set({ userLanguage: language }),
}));
