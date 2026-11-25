import { ChevronRight, LockKeyhole, Shell, Sprout, Store, X } from "lucide-react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useStore } from "zustand"

import { FarmLeaderboard } from "@/components/Leaderboard/FarmLeaderboard"
import { buyCulture, canCollectStarter, collectStarter, MARKET_CATALOG, sellHarvest, STARTER_CROP_ID } from "@/engine/economy"
import { hotbarActions, hotbarStore, type HotbarType } from "@/engine/hotbarStore"
import { inventoryStore } from "@/engine/inventoryStore"
import { getCropSpriteStyle } from "@/engine/rendering/cropRenderer"
import { worldStore } from "@/engine/store"
import "./ReefMarket.css"

type MarketMode = "buy" | "sell"
type Listing = (typeof MARKET_CATALOG)[number]

function CropIcon({ crop, mode }: { crop: Listing; mode: MarketMode }) {
  const style = getCropSpriteStyle(crop.cropId, mode === "buy" ? "seedPacket" : "harvestItem")
  return <span className="reef-market__icon" aria-hidden="true"><span style={style ?? undefined} /></span>
}

// Reuse an existing shortcut first; leave the player's other shortcuts intact.
function equipCulture(seedId: string) {
  const state = hotbarStore.getState()
  const bars: [HotbarType, typeof state.mainHotbar][] = [
    ["main", state.mainHotbar], ["custom1", state.customHotbar1], ["custom2", state.customHotbar2],
  ]
  for (const target of [seedId, null]) {
    for (const [bar, slots] of bars) {
      const index = slots.findIndex(slot => slot.itemId === target)
      if (index === -1) continue
      if (target === null) {
        const packIndex = inventoryStore.getState().slots.findIndex(slot => slot?.id === seedId)
        if (packIndex === -1) return false
        hotbarActions.transferFromInventory(packIndex, bar, index, seedId)
      }
      hotbarStore.setState({ activeHotbar: bar, activeSlotIndex: index })
      return true
    }
  }
  return false
}

export function ReefMarket() {
  const { t, i18n } = useTranslation("market")
  const inventory = useStore(inventoryStore)
  const eligibleForStarter = useStore(worldStore, state => canCollectStarter(inventory, state.entities))
  const { balance, totalSales } = inventory.economy
  const [mode, setMode] = useState<MarketMode>("buy")
  const [selectedId, setSelectedId] = useState(STARTER_CROP_ID as string)
  const [quantity, setQuantity] = useState("1")
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const format = (value: number) => value.toLocaleString(i18n.language)
  const name = (id: string) => t(`crops:species.${id}`)
  const stock = (id: string) => inventory.itemsMap.get(id)?.quantity ?? 0
  const listings = mode === "buy" ? MARKET_CATALOG : MARKET_CATALOG.filter(item => stock(item.harvestId) > 0)
  const item = listings.find(row => row.cropId === selectedId) ?? listings[0]
  const unitPrice = item ? (mode === "buy" ? item.buyPrice : item.sellPrice) : 0
  const available = item ? stock(mode === "buy" ? item.seedId : item.harvestId) : 0
  const amount = Number(quantity)
  const validAmount = Number.isSafeInteger(amount) && amount > 0 && Number.isSafeInteger(amount * unitPrice)
  const locked = mode === "buy" && item && totalSales < item.unlockAt
  const maxQuantity = mode === "buy" ? Math.floor(balance / unitPrice) : available
  const canTrade = item && !locked && validAmount && amount <= maxQuantity
  const nextTier = MARKET_CATALOG.find(row => row.unlockAt > totalSales)

  function chooseMode(value: MarketMode) {
    setMode(value)
    setQuantity("1")
    setMessage("")
  }

  function trade() {
    if (!item || !canTrade) return
    const result = mode === "buy" ? buyCulture(item.cropId, amount) : sellHarvest(item.cropId, amount)
    const params = { quantity: format(amount), item: name(item.cropId), total: format(amount * unitPrice) }
    setMessage(result === "ok" ? t(mode === "buy" ? "bought" : "sold", params) : t(`error.${result}`))
    if (result === "ok") setQuantity("1")
  }

  function openMarket() {
    setMessage("")
    setQuantity("1")
    setOpen(true)
    dialog.current?.showModal()
  }

  return <>
    <div className="reef-market-hud">
      <button type="button" className="reef-market__launcher" onClick={openMarket} aria-haspopup="dialog">
      <Store size={17} aria-hidden="true" /> {t("market")}
      <span className="reef-market__wallet"><Shell size={16} aria-hidden="true" /> {format(balance)}
        <span className="sr-only"> {t("shells")}</span>
      </span>
      </button>
      <FarmLeaderboard />
    </div>
    <dialog ref={dialog} className="reef-market" aria-labelledby="reef-market-title" onClose={() => setOpen(false)}
      onKeyDown={e => e.stopPropagation()} onKeyUp={e => e.stopPropagation()}>
      {open && <>
      <header className="reef-market__header">
        <h2 id="reef-market-title"><Store size={23} /> {t("market")}</h2>
        <span className="reef-market__wallet"><Shell size={18} aria-hidden="true" /> {format(balance)} {t("shells")}</span>
        <button type="button" aria-label={t("close")} className="reef-market__close" onClick={() => dialog.current?.close()}><X size={19} /></button>
      </header>
      <div className="reef-market__modes" role="group" aria-label={t("trade")}>
        {(["buy", "sell"] as const).map(value =>
          <button key={value} type="button" aria-pressed={mode === value} onClick={() => chooseMode(value)}>{t(value)}</button>)}
      </div>
      {item ? <div className="reef-market__shop">
        <label className="reef-market__picker">{t("species")}
          <select value={item.cropId} onChange={e => { setSelectedId(e.target.value); setQuantity("1"); setMessage("") }}>
            {listings.map(crop => <option value={crop.cropId} key={crop.cropId}>{name(crop.cropId)}
              {mode === "buy" && crop.unlockAt > totalSales ? " · " + t("lockedLabel") : ""}</option>)}
          </select>
        </label>
        <div className="reef-market__list" role="group" aria-label={t(mode)}>
          {listings.map(crop => {
            const gated = mode === "buy" && crop.unlockAt > totalSales
            return <button type="button" className="reef-market__listing" key={crop.cropId}
              aria-pressed={crop.cropId === item.cropId} onClick={() => { setSelectedId(crop.cropId); setQuantity("1"); setMessage("") }}>
              <CropIcon crop={crop} mode={mode} />
              <span>{name(crop.cropId)}<small>{gated ? t("lockedLabel") :
                t("unitPrice", { price: format(mode === "buy" ? crop.buyPrice : crop.sellPrice) })}</small></span>
              {gated ? <LockKeyhole size={14} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
            </button>
          })}
        </div>
        <section className="reef-market__detail" aria-label={name(item.cropId)}>
          <div className="reef-market__specimen"><CropIcon crop={item} mode="sell" /></div>
          <h3>{name(item.cropId)}</h3>
          <dl>
            <div><dt>{t(mode === "buy" ? "culturePrice" : "harvestPrice")}</dt><dd>{format(unitPrice)} {t("shells")}</dd></div>
            <div><dt>{t(mode === "buy" ? "cultureStock" : "harvestStock")}</dt><dd>{format(available)}</dd></div>
            {mode === "buy" && <div><dt>{t("maturity")}</dt><dd>{t("gameMinutes", { minutes: format(item.growMinutes) })}</dd></div>}
          </dl>
          {locked ? <p className="reef-market__hint"><LockKeyhole size={15} />{t("unlock", { target: format(item.unlockAt) })}</p> :
            <>
              <label className="reef-market__quantity">{t("quantity")}
                <input type="number" min="1" max={maxQuantity || undefined} step="1" inputMode="numeric" value={quantity}
                  onChange={e => { setQuantity(e.target.value); setMessage("") }} />
              </label>
              <button type="button" className="reef-market__primary" disabled={!canTrade} onClick={trade}>
                {t(mode === "buy" ? "buyTotal" : "sellTotal", { total: format(validAmount ? amount * unitPrice : 0) })}
              </button>
              {!canTrade && <small>{t(!validAmount ? "error.invalid" : mode === "buy" ? "error.funds" : "error.stock")}</small>}
            </>}
          {mode === "buy" && available > 0 && <button type="button" className="reef-market__equip" onClick={() => {
            if (equipCulture(item.seedId)) dialog.current?.close()
            else setMessage(t("hotbarFull"))
          }}><Sprout size={16} />{t("equip")}</button>}
        </section>
      </div> : <p className="reef-market__empty">{t("empty")}</p>}
      <footer className="reef-market__footer">
        <p role="status" aria-live="polite">{message}</p>
        {eligibleForStarter && <button type="button" className="reef-market__equip" onClick={() => {
          const result = collectStarter()
          if (result === "ok") { chooseMode("buy"); setSelectedId(STARTER_CROP_ID); setMessage(t("starterReceived")) }
          else setMessage(t(`error.${result}`))
        }}>{t("starter")}</button>}
        {totalSales === 0 ? <p>{t("firstSale")}</p> : <p>{t("lifetime", { sales: format(totalSales) })}
          {nextTier && <> · {t("next", { remaining: format(nextTier.unlockAt - totalSales) })}</>}
        </p>}
      </footer>
      </>}
    </dialog>
  </>
}
