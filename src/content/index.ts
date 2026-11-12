/**
 * Chrome Content Script - Injected into active HTTP/HTTPS pages
 * Uses Shadow DOM to isolate styles and non-blocking toast notifications.
 */

let shadowRootRef: ShadowRoot | null = null;

function showShadowToast(title: string, body: string) {
  if (!shadowRootRef) return;
  const existing = shadowRootRef.getElementById("cl-toast");
  if (existing) existing.remove();

  const toastEl = document.createElement("div");
  toastEl.id = "cl-toast";
  toastEl.className = "cl-toast";
  toastEl.innerHTML = `
    <div class="cl-toast-title">${title}</div>
    <div class="cl-toast-body">${body}</div>
  `;
  shadowRootRef.appendChild(toastEl);

  setTimeout(() => {
    toastEl.classList.add("cl-toast-hide");
    setTimeout(() => toastEl.remove(), 250);
  }, 4000);
}

function injectFloatingLauncher() {
  if (document.getElementById("chromelaunch-floating-root")) return;

  const host = document.createElement("div");
  host.id = "chromelaunch-floating-root";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadowRootRef = shadow;

  const container = document.createElement("div");
  container.innerHTML = `
    <style>
      .cl-badge {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        background: #09090b;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 9999px;
        padding: 8px 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
      }
      .cl-badge:hover {
        transform: translateY(-2px) scale(1.02);
        background: #18181b;
        border-color: rgba(99, 102, 241, 0.5);
      }
      .cl-badge:active {
        transform: translateY(0) scale(0.98);
      }
      .cl-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 9999px;
        animation: cl-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      .cl-toast {
        position: fixed;
        bottom: 76px;
        right: 24px;
        z-index: 2147483647;
        width: 280px;
        background: #09090b;
        color: #fafafa;
        border: 1px solid rgba(99, 102, 241, 0.4);
        border-radius: 14px;
        padding: 12px 14px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
        animation: cl-slide-up 0.2s ease-out;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .cl-toast-hide {
        opacity: 0;
        transform: translateY(8px);
      }
      .cl-toast-title {
        font-size: 12px;
        font-weight: 700;
        color: #818cf8;
        margin-bottom: 4px;
      }
      .cl-toast-body {
        font-size: 11px;
        color: #d4d4d8;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      @keyframes cl-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
      }
      @keyframes cl-slide-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
    <div class="cl-badge" id="cl-trigger" role="button" tabindex="0" aria-label="Abrir ChromeLaunch Side Panel">
      <div class="cl-dot"></div>
      <span>ChromeLaunch</span>
    </div>
  `;

  shadow.appendChild(container);

  const trigger = shadow.getElementById("cl-trigger");
  trigger?.addEventListener("click", () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" }, (res) => {
        if (chrome.runtime.lastError || !res?.success) {
          showShadowToast(
            "ChromeLaunch Activo",
            "Haz clic en el icono de la extensión en tu barra superior para abrir el panel."
          );
        }
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectFloatingLauncher);
} else {
  injectFloatingLauncher();
}

if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_CURRENT_PAGE_INFO") {
      const text = document.body?.innerText || "";
      const words = text.trim().split(/\s+/).filter(Boolean).length;

      sendResponse({
        type: "PAGE_INFO_RESPONSE",
        title: document.title || "Sin título",
        url: window.location.href,
        wordCount: words,
      });
      return false;
    }

    if (message.type === "TRIGGER_SELECTION_ANALYSIS") {
      const snippet = String(message.text || "").slice(0, 140);
      showShadowToast("⚡ Texto analizado con ChromeLaunch", `"${snippet}"`);
      sendResponse({ received: true });
      return false;
    }
    return false;
  });
}
