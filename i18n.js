import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: "en",
    interpolation: { escapeValue: false },
    resources: {
      en: { translation: require("./locales/en/translation.json") },
      de: { translation: require("./locales/de/translation.json") },
      fr: { translation: require("./locales/fr/translation.json") },
      it: { translation: require("./locales/it/translation.json") },
      pt: { translation: require("./locales/pt/translation.json") },
      hi: { translation: require("./locales/hi/translation.json") },
      es: { translation: require("./locales/es/translation.json") },
      th: { translation: require("./locales/th/translation.json") }
    }
  });

export default i18n;
