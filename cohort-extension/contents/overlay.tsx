import type { PlasmoCSConfig, PlasmoGetOverlayAnchor, PlasmoGetStyle } from "plasmo"
import { useState, useEffect } from "react"

export const config: PlasmoCSConfig = {
    matches: [
        "https://www.amazon.com/*",
        "https://www.amazon.co.uk/*",
        "https://www.bestbuy.com/*",
        "https://www.walmart.com/*",
    ],
}

// Anchor the overlay to the body
export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
    document.body

// Custom styles for the overlay
export const getStyle: PlasmoGetStyle = () => {
    const style = document.createElement("style")
    style.textContent = `
    .cohort-overlay {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, sans-serif;
    }
  `
    return style
}

interface ProductData {
    title: string
    price: string
    url: string
}

function CohortOverlay() {
    const [isOpen, setIsOpen] = useState(false)
    const [product, setProduct] = useState<ProductData | null>(null)
    const [poolCount, setPoolCount] = useState(0)

    useEffect(() => {
        // Detect product on this page
        const detectProduct = () => {
            const title = document.querySelector("#productTitle, .sku-title h1, [itemprop='name']")?.textContent?.trim()
            const priceEl = document.querySelector(".a-price-whole, [data-testid='customer-price'] span, [itemprop='price']")
            const price = priceEl?.textContent?.trim()

            if (title) {
                setProduct({
                    title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
                    price: price || "N/A",
                    url: window.location.href,
                })
            }
        }

        detectProduct()
    }, [])

    if (!product) return null

    return (
        <div className="cohort-overlay">
            {/* Collapsed State - FAB Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)"
                        e.currentTarget.style.boxShadow = "0 6px 24px rgba(245, 158, 11, 0.5)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)"
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(245, 158, 11, 0.4)"
                    }}
                >
                    🛒
                </button>
            )}

            {/* Expanded State - Mini Card */}
            {isOpen && (
                <div
                    style={{
                        width: 280,
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                        borderRadius: 16,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        overflow: "hidden",
                        color: "#fff",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "rgba(245, 158, 11, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 20 }}>🛒</span>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Cohort</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#fff",
                                fontSize: 18,
                                cursor: "pointer",
                                opacity: 0.7,
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: 16 }}>
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                            Current Product
                        </div>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 8,
                            lineHeight: 1.4,
                        }}>
                            {product.title}
                        </div>
                        <div style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#f59e0b",
                        }}>
                            {product.price}
                        </div>

                        {/* Pool Status */}
                        <div style={{
                            marginTop: 16,
                            padding: 12,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 8,
                            textAlign: "center",
                        }}>
                            {poolCount > 0 ? (
                                <>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>
                                        {poolCount}
                                    </div>
                                    <div style={{ fontSize: 11, opacity: 0.7 }}>
                                        Active Pools
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: 12, opacity: 0.6 }}>
                                    No active pools yet
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => {
                                const params = new URLSearchParams({
                                    title: product.title,
                                    price: product.price,
                                    url: product.url,
                                })
                                window.open(`http://localhost:3000/products/new?${params.toString()}`, "_blank")
                            }}
                            style={{
                                width: "100%",
                                marginTop: 12,
                                padding: "12px",
                                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            🚀 Start a Pool
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CohortOverlay
