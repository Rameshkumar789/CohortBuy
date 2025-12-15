import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: [
        "https://www.amazon.com/*",
        "https://www.amazon.co.uk/*",
        "https://www.bestbuy.com/*",
        "https://www.walmart.com/*",
        "https://www.target.com/*",
        "https://www.newegg.com/*",
        "https://www.ebay.com/*",
    ],
    all_frames: false,
    run_at: "document_idle",
}

interface ProductData {
    title: string
    price: string
    image: string
    url: string
    retailer: string
}

// Detect retailer from URL
function getRetailer(): string {
    const host = window.location.hostname.toLowerCase()
    if (host.includes("amazon")) return "amazon"
    if (host.includes("bestbuy")) return "bestbuy"
    if (host.includes("walmart")) return "walmart"
    if (host.includes("target")) return "target"
    if (host.includes("newegg")) return "newegg"
    if (host.includes("ebay")) return "ebay"
    return "unknown"
}

// Amazon scraping
function extractFromAmazon(): Partial<ProductData> | null {
    const title = document.querySelector("#productTitle")?.textContent?.trim()

    // Try multiple price selectors
    const priceWhole = document.querySelector(".a-price-whole")?.textContent?.trim() || ""
    const priceFraction = document.querySelector(".a-price-fraction")?.textContent?.trim() || ""

    let price = ""
    if (priceWhole) {
        price = `$${priceWhole}${priceFraction}`
    } else {
        const altPrice = document.querySelector("#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen")?.textContent?.trim()
        if (altPrice) price = altPrice
    }

    const image = document.querySelector("#landingImage, #imgBlkFront")?.getAttribute("src") || ""

    if (title) {
        return { title, price: price || "N/A", image }
    }

    return null
}

// Best Buy scraping
function extractFromBestBuy(): Partial<ProductData> | null {
    const title = document.querySelector(".sku-title h1, [data-testid='product-title']")?.textContent?.trim()
    const price = document.querySelector("[data-testid='customer-price'] .priceView-hero-price span, .priceView-customer-price span")?.textContent?.trim()
    const image = document.querySelector(".primary-image img, .shop-media-gallery img")?.getAttribute("src") || ""

    if (title) {
        return { title, price: price || "N/A", image }
    }

    return null
}

// Walmart scraping - updated selectors
function extractFromWalmart(): Partial<ProductData> | null {
    // Try multiple title selectors
    const title = document.querySelector("h1[itemprop='name'], h1.prod-ProductTitle, [data-testid='product-title']")?.textContent?.trim() ||
        document.querySelector("h1")?.textContent?.trim()

    // Try multiple price selectors for Walmart
    let price = ""

    // New Walmart layout
    const priceSpan = document.querySelector("[itemprop='price'], [data-testid='price-wrap'] span, .price-characteristic")
    if (priceSpan) {
        price = priceSpan.textContent?.trim() || ""
    }

    // Try to get from the current price display
    if (!price) {
        const priceDisplay = document.querySelector("[data-automation-id='product-price'] span, .prod-PriceHero span")
        if (priceDisplay) {
            price = priceDisplay.textContent?.trim() || ""
        }
    }

    // Look for price in aria-label
    if (!price) {
        const priceContainer = document.querySelector("[aria-label*='current price']")
        const ariaPrice = priceContainer?.getAttribute("aria-label")
        if (ariaPrice) {
            const match = ariaPrice.match(/\$[\d.]+/)
            if (match) price = match[0]
        }
    }

    // Get image
    const image = document.querySelector("[data-testid='hero-image'] img, .prod-hero-image img, [id*='main-image'] img")?.getAttribute("src") ||
        document.querySelector("img[alt*='product'], img.prod-hero-image-image")?.getAttribute("src") || ""

    if (title) {
        // Format price if needed
        if (price && !price.startsWith("$")) {
            price = `$${price}`
        }
        return { title, price: price || "N/A", image }
    }

    return null
}

// Target scraping
function extractFromTarget(): Partial<ProductData> | null {
    const title = document.querySelector("[data-test='product-title'] h1, h1[data-test='product-title']")?.textContent?.trim()
    const price = document.querySelector("[data-test='product-price'] span, .styles__CurrentPriceFontSize")?.textContent?.trim()
    const image = document.querySelector("[data-test='product-hero-images'] img, .slide--active img")?.getAttribute("src") || ""

    if (title) {
        return { title, price: price || "N/A", image }
    }

    return null
}

// Try to extract product from JSON-LD
function extractFromJsonLd(): Partial<ProductData> | null {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')

    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent || "")

            // Handle array of JSON-LD objects
            const items = Array.isArray(data) ? data : [data]

            for (const item of items) {
                if (item["@type"] === "Product" || item["@type"]?.includes?.("Product")) {
                    const price = item.offers?.price ||
                        item.offers?.lowPrice ||
                        item.offers?.[0]?.price ||
                        ""

                    return {
                        title: item.name || "",
                        price: price ? `$${parseFloat(price).toFixed(2)}` : "N/A",
                        image: Array.isArray(item.image) ? item.image[0] : item.image || "",
                    }
                }
            }
        } catch (e) {
            // Invalid JSON, continue
        }
    }

    return null
}

// Try to extract from Open Graph meta tags
function extractFromOpenGraph(): Partial<ProductData> | null {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content")
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content")
    const ogPrice = document.querySelector('meta[property="product:price:amount"]')?.getAttribute("content")

    if (ogTitle) {
        return {
            title: ogTitle,
            price: ogPrice ? `$${parseFloat(ogPrice).toFixed(2)}` : "N/A",
            image: ogImage || "",
        }
    }

    return null
}

// Main function to detect product
function detectProduct(): ProductData | null {
    const retailer = getRetailer()
    const url = window.location.href

    let productData: Partial<ProductData> | null = null

    // Try retailer-specific extraction first
    switch (retailer) {
        case "amazon":
            productData = extractFromAmazon()
            break
        case "bestbuy":
            productData = extractFromBestBuy()
            break
        case "walmart":
            productData = extractFromWalmart()
            break
        case "target":
            productData = extractFromTarget()
            break
    }

    // Fallback to JSON-LD
    if (!productData?.title) {
        productData = extractFromJsonLd() || productData
    }

    // Fallback to Open Graph
    if (!productData?.title) {
        productData = extractFromOpenGraph() || productData
    }

    // If we found a product, return it
    if (productData?.title) {
        return {
            title: productData.title,
            price: productData.price || "N/A",
            image: productData.image || "",
            url,
            retailer,
        }
    }

    return null
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PRODUCT") {
        console.log("Cohort: Received GET_PRODUCT request")
        const product = detectProduct()
        console.log("Cohort: Detected product:", product)
        sendResponse({ product })
    }
    return true
})

// Auto-detect on page load
setTimeout(() => {
    const product = detectProduct()
    if (product) {
        chrome.runtime.sendMessage({ type: "PRODUCT_DETECTED", product })
        console.log("Cohort: Product auto-detected:", product)
    }
}, 1000)

export { }
