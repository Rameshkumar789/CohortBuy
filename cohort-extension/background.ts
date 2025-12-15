// Background service worker for Cohort extension

interface ProductData {
    title: string
    price: string
    image: string
    url: string
    retailer: string
}

// Store for current tab's product
const tabProducts: Map<number, ProductData> = new Map()

// Listen for product detection from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PRODUCT_DETECTED" && sender.tab?.id) {
        tabProducts.set(sender.tab.id, message.product)

        // Update badge to show product detected
        chrome.action.setBadgeText({
            text: "✓",
            tabId: sender.tab.id
        })
        chrome.action.setBadgeBackgroundColor({
            color: "#22c55e",
            tabId: sender.tab.id
        })
    }

    if (message.type === "GET_TAB_PRODUCT" && sender.tab?.id) {
        sendResponse({ product: tabProducts.get(sender.tab.id) })
    }

    return true
})

// Clear product data when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    tabProducts.delete(tabId)
})

// Clear product data when tab navigates away
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        tabProducts.delete(tabId)
        chrome.action.setBadgeText({ text: "", tabId })
    }
})

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // Open welcome page
        chrome.tabs.create({ url: "http://localhost:3000/extension-welcome" })
    }
})

export { }
