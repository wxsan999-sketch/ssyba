import { createClient } from "@supabase/supabase-js"
import "../../../js/supabase-config.js"

declare global {
  var SSYBA_SUPABASE: { url: string; key: string }
}

const { url, key } = globalThis.SSYBA_SUPABASE
// The portal and the game share the SDK's default auth storage on this origin.
export const saveClient = createClient(url, key)
let userId: string | null = null

export function saveOwner() {
  return userId
}

export function deviceKey(name: string) {
  return userId ? `sea-farm-user-${userId}-${name}` : `sea-farm-${name}`
}

export function initializeSaveSession(): Promise<void> {
  return new Promise(resolve => {
    let initialized = false
    saveClient.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user.id ?? null
      if (initialized && userId !== nextUser) {
        // The simulation, open forms and cached layouts all belong to the old player.
        // Start the new session with clean stores, including when another tab signs out.
        window.location.reload()
        return
      }
      userId = nextUser
      initialized = true
      resolve()
    })
  })
}
