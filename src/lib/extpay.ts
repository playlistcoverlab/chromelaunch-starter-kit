/**
 * ExtensionPay (Stripe for Chrome Extensions) Engine
 * 
 * Reactive cross-component subscription state without page reloads or blocking alerts.
 */

import { useState, useEffect, useCallback } from "react";

export interface UserSubscription {
  paid: boolean;
  paidAt: string | null;
  installedAt: string;
  trialStartedAt: string | null;
  subscriptionCancelAt: string | null;
  email?: string;
  isMock?: boolean;
}

export const EXTENSION_ID = "sample-chromelaunch-extension";
export const USE_SIMULATOR_IN_DEV = true;

const STORAGE_KEY_DEV_PLAN = "chromelaunch_dev_premium_state";
const PLAN_CHANGE_EVENT = "chromelaunch:plan-updated";

function notifyPlanListeners() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PLAN_CHANGE_EVENT));
  }
}

class ExtensionPayClient {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  async getUser(): Promise<UserSubscription> {
    if (USE_SIMULATOR_IN_DEV) {
      const stored = localStorage.getItem(STORAGE_KEY_DEV_PLAN);
      const isPaid = stored === "true";
      return {
        paid: isPaid,
        paidAt: isPaid ? new Date().toISOString() : null,
        installedAt: new Date().toISOString(),
        trialStartedAt: null,
        subscriptionCancelAt: null,
        email: isPaid ? "pro-license@chromelaunch.dev" : undefined,
        isMock: true,
      };
    }

    try {
      const win = window as unknown as { ExtPay?: (id: string) => { getUser: () => Promise<UserSubscription> } };
      if (typeof window !== "undefined" && win.ExtPay) {
        const instance = win.ExtPay(this.id);
        return await instance.getUser();
      }
    } catch (err) {
      console.warn("[ExtPay] Error connecting to ExtensionPay service:", err);
    }

    return {
      paid: false,
      paidAt: null,
      installedAt: new Date().toISOString(),
      trialStartedAt: null,
      subscriptionCancelAt: null,
    };
  }

  openPaymentPage(): boolean {
    if (USE_SIMULATOR_IN_DEV) {
      localStorage.setItem(STORAGE_KEY_DEV_PLAN, "true");
      notifyPlanListeners();
      return true;
    }

    const checkoutUrl = `https://extensionpay.com/extension/${encodeURIComponent(this.id)}`;
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: checkoutUrl });
    } else {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
    return false;
  }

  openLoginPage() {
    const loginUrl = `https://extensionpay.com/extension/${encodeURIComponent(this.id)}`;
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: loginUrl });
    } else {
      window.open(loginUrl, "_blank", "noopener,noreferrer");
    }
  }

  toggleDevPlan(): boolean {
    const current = localStorage.getItem(STORAGE_KEY_DEV_PLAN) === "true";
    const next = !current;
    localStorage.setItem(STORAGE_KEY_DEV_PLAN, String(next));
    notifyPlanListeners();
    return next;
  }
}

export const extpay = new ExtensionPayClient(EXTENSION_ID);

export function useExtensionPay() {
  const [user, setUser] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await extpay.getUser();
      setUser(data);
    } catch (error) {
      console.error("[useExtensionPay] failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const handleUpdate = () => {
      refreshUser();
    };
    window.addEventListener(PLAN_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(PLAN_CHANGE_EVENT, handleUpdate);
  }, [refreshUser]);

  return {
    user,
    isPaid: Boolean(user?.paid),
    isLoading,
    refreshUser,
    upgradeToPro: () => extpay.openPaymentPage(),
    openLoginPage: () => extpay.openLoginPage(),
    toggleDevPlan: () => extpay.toggleDevPlan(),
  };
}
