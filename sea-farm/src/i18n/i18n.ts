import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enControls from "./locales/en/controls.json"
import enCrops from "./locales/en/crops.json"
import enIntro from "./locales/en/intro.json"
import enLaboratory from "./locales/en/laboratory.json"
import enMenu from "./locales/en/menu.json"
import enReefObjects from "./locales/en/reefObjects.json"
import esControls from "./locales/es/controls.json"
import esCrops from "./locales/es/crops.json"
import esIntro from "./locales/es/intro.json"
import esLaboratory from "./locales/es/laboratory.json"
import esMenu from "./locales/es/menu.json"
import esReefObjects from "./locales/es/reefObjects.json"
import thControls from "./locales/th/controls.json"
import thCrops from "./locales/th/crops.json"
import thIntro from "./locales/th/intro.json"
import thLaboratory from "./locales/th/laboratory.json"
import thMenu from "./locales/th/menu.json"
import thReefObjects from "./locales/th/reefObjects.json"
import enSaves from "./locales/en/saves.json"
import esSaves from "./locales/es/saves.json"
import thSaves from "./locales/th/saves.json"

const resources = {
  th: {
    controls: thControls,
    reefObjects: thReefObjects,
    crops: thCrops,
    intro: thIntro,
    laboratory: thLaboratory,
    menu: thMenu,
    saves: thSaves,
  },
  en: {
    controls: enControls,
    reefObjects: enReefObjects,
    crops: enCrops,
    intro: enIntro,
    laboratory: enLaboratory,
    menu: enMenu,
    saves: enSaves,
  },
  es: {
    controls: esControls,
    reefObjects: esReefObjects,
    crops: esCrops,
    intro: esIntro,
    laboratory: esLaboratory,
    menu: esMenu,
    saves: esSaves,
  },
}

export const languageStorageKey = "sea-farm-language"
const savedLanguage = localStorage.getItem(languageStorageKey)
const browserLanguage = navigator.language.split("-")[0]
const language = savedLanguage || browserLanguage

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng
})

i18n.use(initReactI18next).init({
  resources,
  lng: Object.prototype.hasOwnProperty.call(resources, language) ? language : "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
})

export default i18n
