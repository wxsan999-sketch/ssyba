import { saveClient, saveOwner } from "./saveSession"

export type SaveMode = "reef" | "garden"
export interface CloudSlot {
  slot_id: string
  name: string
  revision: string
}

const table = "sea_farm_saves"
const columns = "slot_id,name,revision"

function requireOwner() {
  const owner = saveOwner()
  if (!owner) throw new Error("Sign in to use cloud saves")
  return owner
}

export async function listCloudSlots(mode: SaveMode): Promise<CloudSlot[]> {
  const { data, error } = await saveClient.from(table).select(columns)
    .eq("user_id", requireOwner()).eq("mode", mode).order("updated_at", { ascending: false })
  if (error) throw error
  return data
}

export async function loadCloudSlot(mode: SaveMode, id: string) {
  const { data, error } = await saveClient.from(table).select(columns + ",payload")
    .eq("user_id", requireOwner()).eq("mode", mode).eq("slot_id", id).single()
  if (error) throw error
  return data as unknown as CloudSlot & { payload: unknown }
}

export class SaveConflict extends Error {}

export async function writeCloudSlot(
  mode: SaveMode, id: string, name: string, payload: unknown, previousRevision?: string,
): Promise<CloudSlot> {
  const owner = requireOwner()
  const values = { name, payload, revision: crypto.randomUUID() }
  const query = previousRevision
    ? saveClient.from(table).update(values).eq("user_id", owner).eq("mode", mode)
      .eq("slot_id", id).eq("revision", previousRevision)
    : saveClient.from(table).insert({ ...values, user_id: owner, mode, slot_id: id })
  const { data, error } = await query.select(columns).maybeSingle()
  if (error?.code === "23505" || (!error && !data)) throw new SaveConflict()
  if (error) throw error
  return data!
}

export async function deleteCloudSlot(mode: SaveMode, slot: CloudSlot) {
  const { data, error } = await saveClient.from(table).delete().eq("user_id", requireOwner())
    .eq("mode", mode).eq("slot_id", slot.slot_id).eq("revision", slot.revision)
    .select("slot_id").maybeSingle()
  if (error) throw error
  if (!data) throw new SaveConflict()
}
