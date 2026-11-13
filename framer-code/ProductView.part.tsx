
// ---------- Product page (v3): gallery + colour swatches + set + toast ----------
// Catalog of every colourway. "slug" is what the bag sends to the Apps Script; "page" is the CMS slug (/shop/<page>).
// A product only becomes buyable when the Apps Script lists its slug in ?drop=1 -> products (see loadDrop).
type CatItem = { slug: string; page: string; type: "hoodie" | "crew" | "joggers"; color: string; colorName: string; hex: string; name: string; price: number; images: string[] }
const IMG = (id: string) => "https://framerusercontent.com/images/" + id
const CATALOG: CatItem[] = [
    { slug: "bijlmer-hoodie", page: "bijlmer-hoodie", type: "hoodie", color: "black", colorName: "Black", hex: "#1A1A1A", name: "Bijlmer Hoodie", price: 79, images: [IMG("dJ2xOSLnNmShnZlaOyea6Wf7U.png"), IMG("DyrJSfyxd6pYWWkfFEyxGd0DU.png"), IMG("upZrZUO29AFqBs22UIcem3IGIw.png")] },
    { slug: "hoodie-grey", page: "hoodie-grey", type: "hoodie", color: "grey", colorName: "Heather Grey", hex: "#B8B8B4", name: "Hoodie Grey", price: 79, images: [IMG("xxlxkNrGKKJs6Lo3O1Gs2e1fDxI.jpg"), IMG("CuIbpdNYqKHP2jmArQ318LNBk.jpg")] },
    { slug: "hoodie-white", page: "hoodie-white", type: "hoodie", color: "white", colorName: "White", hex: "#F3F1EC", name: "Hoodie White", price: 79, images: [IMG("NvcNGSEOJuAyAoLnMaVh8gNBSLQ.jpg")] },
    { slug: "hoodie-navy", page: "hoodie-navy", type: "hoodie", color: "navy", colorName: "Navy", hex: "#1F2B47", name: "Hoodie Navy", price: 79, images: [IMG("D68gtrsAB5wHXMObMPMnTS874.jpg"), IMG("vaYLkvEebCMtMWF0B9CbzwJ7dk.jpg")] },
    { slug: "arena-hoodie", page: "arena-bomber", type: "hoodie", color: "red", colorName: "Red", hex: "#C42330", name: "ArenA Hoodie", price: 79, images: [IMG("EjhDFhPGKVLGZHhjcFay3RlKY.png"), IMG("GGy6AsgCYFCQR3K0asgwcbxhAvU.png")] },
    { slug: "hoodie-pink", page: "hoodie-pink", type: "hoodie", color: "pink", colorName: "Pink", hex: "#EFC3CD", name: "Hoodie Pink", price: 79, images: [IMG("SGhl9Y5FO1JrpDKKcTRUpiDlsI.jpg"), IMG("vvX34baKz1z7Jiejfo7pGv63w.jpg")] },
    { slug: "crew-black", page: "crew-black", type: "crew", color: "black", colorName: "Black", hex: "#1A1A1A", name: "Crewneck Black", price: 69, images: [IMG("GDiAgDwl3dXlRwRqGfGCziLWDE.jpg")] },
    { slug: "station-crew", page: "station-crew", type: "crew", color: "grey", colorName: "Heather Grey", hex: "#B8B8B4", name: "Station Crew", price: 69, images: [IMG("aCQe7DOZf4fX8XAbrhvfqG61dpw.png"), IMG("d3Sm95ByvSE5QCJZnAz1OtlMcc.png"), IMG("Ds5vqdlsQpXu6bAaALdRBXBrQE.png")] },
    { slug: "crew-white", page: "crew-white", type: "crew", color: "white", colorName: "White", hex: "#F3F1EC", name: "Crewneck White", price: 69, images: [IMG("vFOFI1vT7MxGvstUrVMlu0vUvFg.jpg")] },
    { slug: "crew-navy", page: "crew-navy", type: "crew", color: "navy", colorName: "Navy", hex: "#1F2B47", name: "Crewneck Navy", price: 69, images: [IMG("FMuEt1NiBsg0vk1zUr1x9c07Sbw.jpg")] },
    { slug: "crew-red", page: "crew-red", type: "crew", color: "red", colorName: "Red", hex: "#C42330", name: "Crewneck Red", price: 69, images: [IMG("6DeTegWTren0Oi4dKeSLYGR20xA.jpg")] },
    { slug: "crew-pink", page: "crew-pink", type: "crew", color: "pink", colorName: "Pink", hex: "#EFC3CD", name: "Crewneck Pink", price: 69, images: [IMG("kQp4L4MU6AHHfTXTO83sfNC7EM.jpg")] },
    { slug: "joggers-black", page: "joggers-black", type: "joggers", color: "black", colorName: "Black", hex: "#1A1A1A", name: "Joggers Black", price: 79, images: [IMG("dJ2xOSLnNmShnZlaOyea6Wf7U.png"), IMG("upZrZUO29AFqBs22UIcem3IGIw.png")] },
    { slug: "joggers-grey", page: "joggers-grey", type: "joggers", color: "grey", colorName: "Heather Grey", hex: "#B8B8B4", name: "Joggers Grey", price: 79, images: [IMG("Ds5vqdlsQpXu6bAaALdRBXBrQE.png"), IMG("aCQe7DOZf4fX8XAbrhvfqG61dpw.png")] },
]
// Products the live Apps Script already sells. Everything else waits until the script lists it.
const LIVE_DEFAULT = ["bijlmer-hoodie", "station-crew", "arena-hoodie"]
const SET_COLORS = ["black", "grey"]
const SET_OFF = 0.1
const SIZE_LIST = ["XS", "S", "M", "L", "XL", "XXL"]
const SIZE_CHART: [string, number, number][] = [["XS", 51, 66], ["S", 54, 69], ["M", 57, 72], ["L", 60, 74], ["XL", 63, 76], ["XXL", 66, 78]]
const TYPE_LABEL = { hoodie: "Hoodie", crew: "Crewneck", joggers: "Joggers" }

function catBySlugOrPage(key: string): CatItem | undefined {
    const k = (key || "").toLowerCase()
    return CATALOG.find((c) => c.page === k) || CATALOG.find((c) => c.slug === k) || CATALOG.find((c) => c.name.toLowerCase().replace(/\s+/g, "-") === k)
}

// Set discount: every top (hoodie or crew) paired with joggers in the same colour gets 10% off both.
export function setDiscountFor(items: Item[]): number {
    let off = 0
    SET_COLORS.forEach((color) => {
        const tops: number[] = []
        const jogs: number[] = []
        items.forEach((i) => {
            const c = CATALOG.find((x) => x.slug === i.slug)
            if (!c || c.color !== color) return
            for (let q = 0; q < i.qty; q++) (c.type === "joggers" ? jogs : tops).push(i.price)
        })
        tops.sort((a, b) => b - a)
        jogs.sort((a, b) => b - a)
        for (let n = 0; n < Math.min(tops.length, jogs.length); n++) off += (tops[n] + jogs[n]) * SET_OFF
    })
    return Math.round(off * 100) / 100
}

function useShop() {
    const [s, setS] = React.useState<{ products: string[]; setDiscount: boolean; all: boolean }>({ products: LIVE_DEFAULT, setDiscount: false, all: false })
    React.useEffect(() => {
        const canvas = RenderTarget.current() === RenderTarget.canvas
        let all = canvas
        try {
            all = all || new URLSearchParams(window.location.search).has("allcolors")
        } catch (e) {}
        if (all) setS((p) => ({ ...p, all: true }))
        if (canvas) return
        let alive = true
        loadDrop(readAccess()).then((d: any) => {
            if (!alive) return
            setS({ products: d.products && d.products.length ? d.products : LIVE_DEFAULT, setDiscount: !!d.setDiscount, all })
        })
        return () => {
            alive = false
        }
    }, [])
    return s
}

function eur(n: number) {
    const t = n.toFixed(2).replace(".", ",")
    return "€ " + (t.endsWith(",00") ? t.slice(0, -3) : t)
}

interface ViewProps {
    slug: string
    video: string
    style?: React.CSSProperties
}

/**
 * Product page v3: photo gallery (arrows + swipe), colour swatches, size + add per piece,
 * "Wear it as a set" with joggers, size chart, info rows and a small "added" toast.
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export function ProductView(props: ViewProps) {
    const { slug, video, style } = props
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const item = catBySlugOrPage(slug) || CATALOG[0]
    const shop = useShop()
    const drop = useDrop()
    const bag = useBag()
    const live = (c: CatItem) => shop.products.indexOf(c.slug) > -1
    const visible = (c: CatItem) => shop.all || live(c)
    const canBuyPhase = drop.phase === "open" || (drop.phase === "list" && drop.access)

    const sameType = CATALOG.filter((c) => c.type === item.type && (visible(c) || c === item))
    const matches: CatItem[] =
        SET_COLORS.indexOf(item.color) < 0
            ? []
            : item.type === "joggers"
              ? CATALOG.filter((c) => c.type !== "joggers" && c.color === item.color && visible(c))
              : CATALOG.filter((c) => c.type === "joggers" && c.color === item.color && visible(c))

    const [img, setImg] = React.useState(0)
    const [sizes, setSizes] = React.useState<Record<string, string>>({})
    const [warn, setWarn] = React.useState<Record<string, boolean>>({})
    const [msel, setMsel] = React.useState(0)
    const [chart, setChart] = React.useState(false)
    const [open, setOpen] = React.useState<Record<string, boolean>>({})
    const [toast, setToast] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [narrow, setNarrow] = React.useState(false)
    const rootRef = React.useRef<HTMLDivElement>(null)
    const touchX = React.useRef<number | null>(null)
    const toastTimer = React.useRef<number | undefined>(undefined)

    React.useEffect(() => {
        setMounted(true)
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((e) => setNarrow(e[0].contentRect.width < 860))
        ro.observe(el)
        return () => {
            ro.disconnect()
            window.clearTimeout(toastTimer.current)
        }
    }, [])

    const images = item.images.length ? item.images : [""]
    const slides = (video && !isCanvas ? ["__video"] : []).concat(images)
    const cur = Math.min(img, slides.length - 1)
    const go = (d: number) => setImg((cur + d + slides.length) % slides.length)
    const match = matches.length ? matches[Math.min(msel, matches.length - 1)] : null
    const inBag = (c: CatItem) => bag.find((b) => b.slug === c.slug)

    const add = (c: CatItem, fallbackSize?: string) => {
        if (!canBuyPhase || !live(c)) return
        const hit = inBag(c)
        if (hit) {
            writeBag(readBag().filter((b) => b.slug !== c.slug))
            return
        }
        const size = sizes[c.slug] || fallbackSize || ""
        if (!size) {
            setWarn({ ...warn, [c.slug]: true })
            return
        }
        const list = readBag()
        list.push({ slug: c.slug, name: c.name, size, qty: 1, price: c.price, image: c.images[0] || "" })
        writeBag(list)
        setToast(true)
        window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => setToast(false), 6000)
    }
    const pickSize = (c: CatItem, s: string) => {
        setSizes({ ...sizes, [c.slug]: s })
        setWarn({ ...warn, [c.slug]: false })
        const hit = inBag(c)
        if (hit) writeBag(readBag().map((b) => (b.slug === c.slug ? { ...b, size: s } : b)))
    }

    const discount = shop.setDiscount ? setDiscountFor(bag) : 0
    const bagTotal = bag.reduce((n, i) => n + i.qty * i.price, 0) - discount

    // ---- styles
    const label: React.CSSProperties = { fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: BONE }
    const line = "1px solid rgba(237,234,227,.14)"
    const pill = (on: boolean, h = 46): React.CSSProperties => ({ height: h, cursor: "pointer", fontFamily: MONO, fontSize: 13, letterSpacing: "0.04em", border: "1px solid " + (on ? BONE : "rgba(237,234,227,.22)"), background: on ? BONE : "transparent", color: on ? INK : MUTED, padding: 0 })
    const arrow = (side: "l" | "r"): React.CSSProperties => ({ position: "absolute", top: "50%", [side === "l" ? "left" : "right"]: 12, transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(237,234,227,.25)", background: "rgba(12,12,12,.35)", color: "rgba(237,234,227,.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: 0 })

    const card = (c: CatItem, isSet: boolean) => {
        const hit = inBag(c)
        const chosen = hit ? hit.size : sizes[c.slug] || (isSet ? sizes[item.slug] || "" : "")
        const buyable = live(c)
        const setPrice = (item.price + c.price) * (1 - SET_OFF)
        let btn = hit ? "In bag ✓ · " + TYPE_LABEL[c.type] + " " + hit.size : "+ Add " + TYPE_LABEL[c.type] + (chosen ? " · " + chosen : "")
        let btnStyle: React.CSSProperties = hit
            ? { border: "1px solid " + BONE, background: "transparent", color: BONE }
            : { border: "none", background: RED, color: INK, boxShadow: "4px 4px 0 " + BONE }
        let disabled = false
        if (!buyable) {
            btn = "Coming soon"
            disabled = true
        } else if (!canBuyPhase) {
            disabled = true
            btn = drop.phase === "closed" ? "Closed · Preorders have ended" : drop.phase === "list" ? "The List is in · Doors open 00:00 CET" : "Locked · Opens 23.11 · 00:00 CET"
        }
        if (disabled) btnStyle = { border: "1px solid rgba(237,234,227,.35)", background: "transparent", color: BONE, cursor: "not-allowed" }
        return (
            <div key={c.slug} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 18, border: line, borderLeft: isSet ? "3px solid " + RED : line, background: "#161616" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 64, height: 80, flex: "0 0 64px", background: "#1A1A1A", overflow: "hidden" }}>
                        {c.images[0] ? <img src={c.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: c.type === "joggers" ? "center 85%" : "center 30%", display: "block" }} /> : null}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                        {isSet ? <div style={{ ...label, color: RED }}>Wear it as a set</div> : null}
                        <div style={{ fontFamily: DISPLAY, fontSize: 28, lineHeight: 1.05, letterSpacing: "0.01em", textTransform: "uppercase", color: BONE }}>{c.name + " — " + c.colorName}</div>
                        <div style={{ fontFamily: DISPLAY, fontSize: 20, color: RED }}>{(isSet ? "+ " : "") + eur(c.price)}</div>
                        {isSet && shop.setDiscount && buyable ? <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: RED }}>{"Set " + eur(setPrice) + " · save " + eur(item.price + c.price - setPrice)}</div> : null}
                    </div>
                </div>
                {isSet && matches.length > 1 ? (
                    <div style={{ display: "flex", gap: 6 }}>
                        {matches.map((m, j) => (
                            <button key={m.slug} type="button" onClick={() => setMsel(j)} style={{ ...pill(j === Math.min(msel, matches.length - 1), 40), padding: "0 14px", fontSize: 12 }}>
                                {TYPE_LABEL[m.type]}
                            </button>
                        ))}
                    </div>
                ) : null}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...label }}>
                    <span style={{ color: warn[c.slug] ? RED : BONE }}>{warn[c.slug] ? "Pick your size first" : hit ? "Size " + hit.size + " · in bag" : "Size"}</span>
                    <button type="button" onClick={() => setChart(!chart)} aria-expanded={chart} style={{ border: "none", background: "transparent", padding: 0, minHeight: 32, cursor: "pointer", font: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: RED, whiteSpace: "nowrap" }}>
                        {chart ? "Size chart ↑" : "Size chart ↓"}
                    </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
                    {SIZE_LIST.map((s) => (
                        <button key={s} type="button" aria-pressed={s === chosen} onClick={() => pickSize(c, s)} style={pill(s === chosen)}>
                            {s}
                        </button>
                    ))}
                </div>
                <button type="button" aria-disabled={disabled} onClick={() => !disabled && add(c, isSet ? sizes[item.slug] : undefined)} style={{ minHeight: 54, padding: "0 16px", cursor: "pointer", fontFamily: MONO, fontWeight: 700, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", ...btnStyle }}>
                    {btn}
                </button>
            </div>
        )
    }

    const fabric =
        item.type === "hoodie"
            ? "Unisex medium fit.\nBrushed inside, double-layered hood, ribbed cuffs that keep their shape.\nOrganic cotton. The curved BIMS wordmark in bone across the chest."
            : item.type === "crew"
              ? "Unisex medium fit.\nBrushed inside, ribbed collar and cuffs that keep their shape.\nOrganic cotton. The curved BIMS wordmark in bone across the chest."
              : "Unisex medium fit.\nBrushed inside, elastic waist with drawcord, ribbed cuffs.\nOrganic cotton. The BIMS wordmark in bone on the leg."
    const rows = [
        { k: "made", t: "Made once, never restocked", b: "Every drop is made once and never again.\nThe Bijlmer was built brick by brick. So is BIMS: every order adds a brick to the wall." },
        { k: "fit", t: "Fit & fabric", b: fabric },
        { k: "ship", t: "Preorder & shipping", b: "Preorder only. Printed on demand after you preorder, so nothing goes to waste.\nPreorders close 06.12 · 23:59 CET. Ships 21.12.\nSecure checkout with iDEAL | Wero, Apple Pay and card." },
    ]

    const slide = slides[cur]
    const gallery = (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: narrow ? "1 1 100%" : "1 1 0", minWidth: 0 }}>
            <div
                onTouchStart={(e) => (touchX.current = e.touches[0] ? e.touches[0].clientX : null)}
                onTouchEnd={(e) => {
                    const t = e.changedTouches[0]
                    if (touchX.current == null || !t) return
                    const dx = t.clientX - touchX.current
                    touchX.current = null
                    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
                }}
                style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", background: "#1A1A1A", overflow: "hidden", touchAction: "pan-y" }}
            >
                {slide === "__video" ? (
                    <video src={video} poster={images[0]} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : slide ? (
                    <img src={slide} alt={item.name + " in " + item.colorName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : null}
                {slides.length > 1 ? (
                    <>
                        <button type="button" aria-label="Previous photo" onClick={() => go(-1)} style={arrow("l")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button type="button" aria-label="Next photo" onClick={() => go(1)} style={arrow("r")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </>
                ) : null}
            </div>
            {slides.length > 1 ? (
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                    {slides.map((s, k) => (
                        <button key={k} type="button" aria-label={"Photo " + (k + 1)} onClick={() => setImg(k)} style={{ padding: 0, flex: "0 0 72px", width: 72, height: 90, background: "#1A1A1A", overflow: "hidden", cursor: "pointer", border: "2px solid " + (k === cur ? BONE : "rgba(237,234,227,.14)") }}>
                            <img src={s === "__video" ? images[0] : s} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )

    const info = (
        <div style={{ flex: narrow ? "1 1 100%" : "0 0 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22, ...(narrow ? {} : { borderLeft: "3px solid " + RED, paddingLeft: 36 }) }}>
            <div style={{ ...label, display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a href="/shop" style={{ color: BONE, textDecoration: "none" }}>← Drop</a>
                <span style={{ color: MUTED }}>Drop 01 · Preorder only · Unisex</span>
            </div>
            <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", margin: 0 }}>{item.name + " — " + item.colorName}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={label}>
                    Colour — <strong>{item.colorName}</strong>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {sameType.map((c) => {
                        const on = c.slug === item.slug
                        return (
                            <a
                                key={c.slug}
                                href={"/shop/" + c.page}
                                aria-label={c.colorName + (on ? " (selected)" : "")}
                                aria-current={on ? "page" : undefined}
                                title={c.colorName}
                                style={{ width: 44, height: 44, borderRadius: "50%", background: c.hex, border: "1px solid rgba(237,234,227,.45)", boxShadow: on ? "0 0 0 3px " + INK + ", 0 0 0 5px " + RED : "none", display: "block", boxSizing: "border-box" }}
                            />
                        )
                    })}
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {card(item, false)}
                {match ? card(match, true) : null}
            </div>
            {!canBuyPhase && drop.phase !== "closed" ? (
                <div style={{ ...label, color: MUTED, textAlign: "center" }}>
                    {drop.ready ? (
                        <>
                            Opens in <span style={{ color: BONE }}>{left(Date.parse(DROP.opens) - drop.now)}</span>
                        </>
                    ) : (
                        "Opens 23.11 · 00:00 CET"
                    )}
                </div>
            ) : canBuyPhase ? (
                <div style={{ ...label, color: drop.phase === "list" ? RED : MUTED, textAlign: "center", fontSize: 12 }}>{drop.phase === "list" ? "Early access · The List" : "Preorder closes in " + left(Date.parse(DROP.closes) - drop.now)}</div>
            ) : null}
            {chart ? (
                <div style={{ border: line, background: "#161616", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: DISPLAY, fontSize: 28, lineHeight: 1.05, textTransform: "uppercase", color: BONE }}>Size chart</div>
                        <button type="button" aria-label="Close size chart" onClick={() => setChart(false)} style={{ width: 44, height: 44, border: "none", background: "transparent", color: BONE, cursor: "pointer", fontSize: 20 }}>
                            ×
                        </button>
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: MUTED }}>Unisex medium fit. Measurements in cm, flat on a table. Use as a guide.</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", ...label, fontSize: 12, color: MUTED, borderBottom: line, paddingBottom: 8 }}>
                        <span>Size</span>
                        <span>Chest width</span>
                        <span>Length</span>
                    </div>
                    {SIZE_CHART.map((r) => (
                        <div key={r[0]} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", alignItems: "center", borderBottom: line, padding: "6px 0", fontFamily: SANS, fontSize: 15, color: BONE }}>
                            <span style={{ fontFamily: DISPLAY, fontSize: 22 }}>{r[0]}</span>
                            <span>{r[1]}</span>
                            <span>{r[2]}</span>
                        </div>
                    ))}
                </div>
            ) : null}
            <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, textAlign: "center" }}>Preorder only · iDEAL | Wero · Apple Pay · Card</div>
            <div style={{ border: line, padding: 16, display: "flex", flexDirection: "column", gap: 6, background: "#161616" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 19, textTransform: "uppercase", color: BONE }}>Every order adds a brick.</div>
                <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: BONE }}>
                    Preorder and get your personal code for Build the Wall. Highest wall when the drop closes wins the whole drop.{" "}
                    <a href="/game" style={{ color: RED, textDecoration: "none", fontWeight: 700 }}>
                        Practice now →
                    </a>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", borderTop: line }}>
                {rows.map((r) => {
                    const o = !!open[r.k]
                    return (
                        <div key={r.k} style={{ display: "flex", flexDirection: "column", borderBottom: line }}>
                            <button type="button" aria-expanded={o} onClick={() => setOpen({ ...open, [r.k]: !o })} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 52, padding: 0, border: "none", background: "transparent", color: BONE, fontFamily: SANS, fontSize: 17, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
                                <span>{r.t}</span>
                                <span style={{ fontFamily: MONO, fontSize: 18 }}>{o ? "−" : "+"}</span>
                            </button>
                            {o ? <div style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: MUTED, paddingBottom: 16, whiteSpace: "pre-line" }}>{r.b}</div> : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )

    const toastEl =
        mounted && toast && bag.length
            ? createPortal(
                  <div role="status" aria-live="polite" style={{ position: "fixed", zIndex: 9997, ...(narrow ? { left: 10, right: 10, bottom: 84 } : { right: 24, top: 96, width: 360 }), background: BONE, color: INK, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "6px 6px 0 " + RED, fontFamily: MONO }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontFamily: DISPLAY, fontSize: 19, textTransform: "uppercase" }}>{discount > 0 ? "✓ Added · set complete" : "✓ Added"}</div>
                          <button type="button" aria-label="Close" onClick={() => setToast(false)} style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", color: INK, fontSize: 18 }}>
                              ×
                          </button>
                      </div>
                      <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.7 }}>In your bag</div>
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                          {bag.map((b) => (
                              <div key={b.slug + b.size}>{(b.qty > 1 ? b.qty + "× " : "") + b.name + " · size " + b.size}</div>
                          ))}
                      </div>
                      <button
                          type="button"
                          onClick={() => {
                              setToast(false)
                              openBag()
                          }}
                          style={{ height: 46, border: "none", background: RED, color: INK, fontFamily: DISPLAY, fontSize: 17, textTransform: "uppercase", cursor: "pointer" }}
                      >
                          {"Checkout · " + eur(bagTotal)}
                      </button>
                  </div>,
                  document.body
              )
            : null

    return (
        <div ref={rootRef} style={{ ...style, width: "100%", display: "flex", flexWrap: "wrap", gap: narrow ? 28 : 48, alignItems: "flex-start", color: BONE, fontFamily: SANS, boxSizing: "border-box" }}>
            {gallery}
            {info}
            {toastEl}
        </div>
    )
}

ProductView.defaultProps = { slug: "bijlmer-hoodie", video: "" }

addPropertyControls(ProductView, {
    slug: { type: ControlType.String, title: "Slug", defaultValue: "bijlmer-hoodie" },
    video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm", "mov"] },
})
