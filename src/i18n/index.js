import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import zh from "./locales/zh";

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

const initialLanguage =
  (typeof window !== "undefined" && window.localStorage.getItem("i18nextLng")) || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
