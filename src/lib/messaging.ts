/**
 * Type-Safe Cross-Context Chrome Messaging
 */

export type ExtensionMessage =
  | { type: "PING" }
  | { type: "PONG"; timestamp: number }
  | { type: "GET_CURRENT_PAGE_INFO" }
  | { type: "PAGE_INFO_RESPONSE"; title: string; url: string; wordCount: number }
  | { type: "OPEN_SIDEPANEL" }
  | { type: "TRIGGER_PAYWALL" };

export function sendToBackground(message: ExtensionMessage): Promise<any> {
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
  return Promise.resolve({ mock: true, received: message });
}

export function sendToActiveTab(message: ExtensionMessage): Promise<any> {
  if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0]?.id;
        if (!activeTabId) {
          reject(new Error("No active tab found"));
          return;
        }
        chrome.tabs.sendMessage(activeTabId, message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    });
  }
  return Promise.resolve({ mock: true, received: message });
}
