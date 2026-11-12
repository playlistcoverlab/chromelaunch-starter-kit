/**
 * Chrome Service Worker (Background Script) - Manifest V3
 * Hardened against duplicate context menus and cross-context SidePanel invocation.
 */

import { type ExtensionMessage } from "../lib/messaging";

// Setup Context Menus safely on Installation / Update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "chromelaunch_analyze",
      title: "⚡ Analizar selección con ChromeLaunch",
      contexts: ["selection"],
    });
  });

  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: false })
      .catch((error) => console.warn("[ChromeLaunch] sidePanel behavior warning:", error));
  }
});

// Context Menu Action Handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "chromelaunch_analyze" && tab?.id) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "TRIGGER_SELECTION_ANALYSIS",
        text: info.selectionText || "",
      },
      () => {
        // Suppress unchecked runtime.lastError if content script isn't injected on restricted page
        void chrome.runtime.lastError;
      }
    );
  }
});

// Centralized Message Router
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === "PING") {
      sendResponse({ type: "PONG", timestamp: Date.now() });
      return false;
    }

    if (message.type === "OPEN_SIDEPANEL") {
      const openPanelForWindow = (windowId: number) => {
        if (chrome.sidePanel?.open) {
          chrome.sidePanel
            .open({ windowId })
            .then(() => sendResponse({ success: true }))
            .catch((err) => {
              console.error("[ChromeLaunch] Failed to open sidepanel:", err);
              sendResponse({ success: false, error: String(err) });
            });
        } else {
          sendResponse({ success: false, error: "SidePanel API not supported" });
        }
      };

      if (sender.tab?.windowId) {
        openPanelForWindow(sender.tab.windowId);
      } else {
        chrome.windows.getCurrent((win) => {
          if (win?.id) {
            openPanelForWindow(win.id);
          } else {
            sendResponse({ success: false, error: "No active windowId found" });
          }
        });
      }
      return true; // Keep message channel open for async response
    }

    return false;
  }
);
