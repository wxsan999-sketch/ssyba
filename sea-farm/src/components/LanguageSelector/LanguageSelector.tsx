import { useTranslation } from "react-i18next"
import { languageStorageKey } from "@/i18n/i18n"
import "./LanguageSelector.css"

const languages = [
  { id: "th", label: "ไทย", name: "ภาษาไทย" },
  { id: "en", label: "EN", name: "English" },
  { id: "es", label: "ES", name: "Español" },
]

export const LanguageSelector = () => {
  const { i18n } = useTranslation()
  return (
    <div className="sea-languages" role="group" aria-label="ภาษา / Language / Idioma">
      {languages.map(({ id, label, name }) => (
        <button key={id} type="button" lang={id} title={name} aria-label={name}
          aria-pressed={i18n.language === id}
          onClick={() => {
            void i18n.changeLanguage(id)
            localStorage.setItem(languageStorageKey, id)
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
