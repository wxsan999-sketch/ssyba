import { useTranslation } from "react-i18next"

export function useControls() {
  return useTranslation("controls").t
}
