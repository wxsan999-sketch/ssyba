import { createClient } from "@supabase/supabase-js"
import type { AuthError } from "@supabase/supabase-js"
import "../../../js/supabase-config.js"

declare global {
  var SSYBA_SUPABASE: { url: string; key: string }
}

const { url, key } = globalThis.SSYBA_SUPABASE
// The portal and the game share the SDK's default auth storage on this origin.
export const saveClient = createClient(url, key)
let userId: string | null = null
let playerName = ""
let changingPlayer = false
let initialization: Promise<boolean> | undefined

export function saveOwner() {
  return changingPlayer ? null : userId
}

export function deviceKey(name: string) {
  return userId ? `sea-farm-user-${userId}-${name}` : `sea-farm-${name}`
}

export function leaderboardName() {
  return playerName
}

function hasInvalidSession(error: AuthError) {
  return error.status === 401 || error.status === 403 || error.name === "AuthSessionMissingError" ||
    ["bad_jwt", "session_not_found", "session_expired", "user_not_found", "refresh_token_not_found", "refresh_token_already_used"].includes(error.code ?? "")
}

async function verifyPlayer(): Promise<boolean> {
  let observedId: string | null | undefined
  saveClient.auth.onAuthStateChange((_event, session) => {
    const nextId = session?.user.id ?? null
    if (observedId !== undefined && observedId !== nextId && !changingPlayer) {
      // Flush local progress under the old player's key but suppress cloud writes
      // once the SDK has switched credentials. New stores start in the next page.
      changingPlayer = true
      window.location.reload()
    }
    observedId = nextId
  })

  const session = await saveClient.auth.getSession()
  if (session.error) {
    if (hasInvalidSession(session.error)) return false
    throw session.error
  }
  if (!session.data.session) return false
  const verified = await saveClient.auth.getUser()
  if (verified.error) {
    if (hasInvalidSession(verified.error)) return false
    throw verified.error
  }
  const user = verified.data.user
  if (!user || user.is_anonymous || user.id !== session.data.session.user.id) return false
  const profile = await saveClient.from("profiles").select("username").eq("id", user.id).maybeSingle()
  if (profile.error) throw profile.error
  if (changingPlayer) return false
  playerName = profile.data?.username || "Diver" // Same fallback as sea_farm_leaderboard.
  userId = user.id
  return true
}

export function initializeSaveSession(): Promise<boolean> {
  initialization ??= verifyPlayer()
  return initialization
}
