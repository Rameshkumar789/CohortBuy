import { useState, useEffect } from "react"

interface Product {
  title: string
  price: string
  image: string
  url: string
  retailer: string
}

function IndexPopup() {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    detectProduct()
  }, [])

  const detectProduct = async () => {
    setIsLoading(true)
    setError("")
    setProduct(null)

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab?.id || !tab?.url) {
        setError("Cannot access this page")
        setIsLoading(false)
        return
      }

      // Check if we're on a supported site
      const url = tab.url.toLowerCase()
      const isSupported = url.includes("amazon.") ||
        url.includes("bestbuy.") ||
        url.includes("walmart.") ||
        url.includes("target.") ||
        url.includes("ebay.")

      if (!isSupported) {
        setError("Visit a supported retailer site")
        setIsLoading(false)
        return
      }

      // Try to send message to content script
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_PRODUCT" })
        if (response?.product) {
          setProduct(response.product)
        } else {
          setError("No product found on this page")
        }
      } catch (msgError) {
        // Content script not ready, try injecting it
        console.log("Content script not ready, trying to inject...")

        // Use scripting API to inject
        if (chrome.scripting) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["product-detector.7b04a0fa.js"]
            })

            // Wait a bit and retry
            await new Promise(r => setTimeout(r, 500))

            const retryResponse = await chrome.tabs.sendMessage(tab.id, { type: "GET_PRODUCT" })
            if (retryResponse?.product) {
              setProduct(retryResponse.product)
            } else {
              setError("Refresh the page and try again")
            }
          } catch (injectError) {
            setError("Refresh the page and try again")
          }
        } else {
          setError("Refresh the page and try again")
        }
      }
    } catch (err: any) {
      console.error("Detection error:", err)
      setError("Failed to detect product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartPool = async () => {
    if (!product) return

    const params = new URLSearchParams({
      title: product.title,
      price: product.price,
      url: product.url,
      image: product.image,
    })
    chrome.tabs.create({
      url: `http://localhost:3000/products/new?${params.toString()}`
    })
  }

  return (
    <div style={{
      width: 360,
      minHeight: 200,
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      color: "#fff",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #f59e0b, #ea580c)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}>
          🛒
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Cohort</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Group Buying Power</div>
        </div>
        <button
          onClick={detectProduct}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          ↻ Retry
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: 40, opacity: 0.7 }}>
            Detecting product...
          </div>
        ) : product ? (
          <>
            {/* Product Card */}
            <div style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ display: "flex", gap: 12 }}>
                {product.image && (
                  <img
                    src={product.image}
                    alt=""
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      objectFit: "cover",
                      background: "#fff",
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: 1.3,
                  }}>
                    {product.title}
                  </div>
                  <div style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#f59e0b",
                    }}>
                      {product.price}
                    </span>
                    <span style={{
                      fontSize: 11,
                      opacity: 0.5,
                      textTransform: "capitalize",
                    }}>
                      {product.retailer}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleStartPool}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              🚀 Start a Pool
            </button>
          </>
        ) : (
          <div style={{
            textAlign: "center",
            padding: 24,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {error || "No Product Detected"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.5, marginBottom: 16 }}>
              Make sure you're on a product page on Amazon, Best Buy, Walmart, or Target
            </div>
            <button
              onClick={detectProduct}
              style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center",
        fontSize: 11,
        opacity: 0.5,
      }}>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#f59e0b", textDecoration: "none" }}
        >
          Open Cohort Dashboard →
        </a>
      </div>
    </div>
  )
}

export default IndexPopup
