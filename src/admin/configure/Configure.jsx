import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSave, FaUndo, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { configureService } from "../../services/configure/configureService";
import { brandService } from "../../services/brands/brandService";
import { useSiteConfig } from "../../context/SiteConfigContext";
import useAuth from "../../hooks/auth/useAuth";

import CompanyTab from "./tabs/CompanyTab";
import ContactTab from "./tabs/ContactTab";
import SocialTab from "./tabs/SocialTab";
import BannersTab from "./tabs/BannersTab";
import ShowcaseTab from "./tabs/ShowcaseTab";
import BrandsTab from "./tabs/BrandsTab";
import CollectionsTab from "./tabs/CollectionsTab";
import LegalTab from "./tabs/LegalTab";
import SeoTab from "./tabs/SeoTab";
import PaymentTab from "./tabs/PaymentTab";
import Header from "../Components/Header";

import {
  cloneDeep,
  isDeepEqual,
  getTabInitialData,
  getTabSavePayload,
} from "./utils/tabStateManager";

const TABS = [
  { id: "company", icon: "apartment", label: "Company" },
  { id: "contact", icon: "phone", label: "Contact" },
  { id: "social", icon: "share", label: "Social Links" },
  { id: "banners", icon: "image", label: "Banners" },
  { id: "showcase", icon: "storefront", label: "Hero Showcase" },
  { id: "brands", icon: "verified", label: "Brands & Dealers" },
  { id: "collections", icon: "grid_view", label: "Collections" },
  { id: "legal", icon: "description", label: "Legal" },
  { id: "seo", icon: "search", label: "SEO" },
  { id: "payment", icon: "payments", label: "Payment" },
];

// Tabs that manage their own subcollections directly
const SELF_MANAGED_TABS = new Set(["banners", "collections"]);

function Configure() {
  const { config, setConfig } = useSiteConfig();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "company";
  const [activeTab, setActiveTab] = useState(
    TABS.some((t) => t.id === initialTab) ? initialTab : "company"
  );

  // Clear any legacy monolithic drafts that could trigger false unsaved warnings
  useEffect(() => {
    try {
      localStorage.removeItem("draft_store_settings");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("draft_store_settings")) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {}
  }, []);

  // Sync tab with searchParams (?tab=...)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TABS.some((t) => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // ─── Independent Tab States ────────────────────────────────────────────────
  const [tabStates, setTabStates] = useState(() => {
    const initial = {};
    for (const t of TABS) {
      if (SELF_MANAGED_TABS.has(t.id)) continue;
      const data = getTabInitialData(t.id, config);
      initial[t.id] = {
        current: cloneDeep(data),
        saved: cloneDeep(data),
        isDirty: false,
        saving: false,
      };
    }
    return initial;
  });

  // Track if config has been synchronized at least once
  const [hasSyncedConfig, setHasSyncedConfig] = useState(false);

  // Synchronize tabs from Firestore config on boot (or when config loads)
  useEffect(() => {
    if (!config || Object.keys(config).length === 0) return;

    setTabStates((prev) => {
      const next = { ...prev };
      for (const t of TABS) {
        if (SELF_MANAGED_TABS.has(t.id)) continue;
        const currentTabState = prev[t.id];

        // If the tab already has unsaved user edits, don't overwrite its working current state
        if (currentTabState?.isDirty && hasSyncedConfig) {
          continue;
        }

        const freshData = getTabInitialData(t.id, config);
        next[t.id] = {
          current: cloneDeep(freshData),
          saved: cloneDeep(freshData),
          isDirty: false,
          saving: false,
        };
      }
      return next;
    });

    setHasSyncedConfig(true);
  }, [config]);

  // ─── Update working draft for a specific tab ────────────────────────────────
  const updateTabDraft = useCallback((tabId, patch) => {
    setTabStates((prev) => {
      const currentTab = prev[tabId];
      if (!currentTab) return prev;

      const newCurrent = { ...currentTab.current, ...patch };
      const dirty = !isDeepEqual(newCurrent, currentTab.saved);

      return {
        ...prev,
        [tabId]: {
          ...currentTab,
          current: newCurrent,
          isDirty: dirty,
        },
      };
    });
  }, []);

  // ─── Helper for immediate field save (e.g. Logo/Favicon in CompanyTab) ──────
  const markFieldSaved = useCallback((tabId, fieldKey, value) => {
    setTabStates((prev) => {
      const currentTab = prev[tabId];
      if (!currentTab) return prev;

      const newCurrent = { ...currentTab.current, [fieldKey]: value };
      const newSaved = { ...currentTab.saved, [fieldKey]: value };
      const dirty = !isDeepEqual(newCurrent, newSaved);

      return {
        ...prev,
        [tabId]: {
          ...currentTab,
          current: newCurrent,
          saved: newSaved,
          isDirty: dirty,
        },
      };
    });
  }, []);

  // ─── Save active tab independently ──────────────────────────────────────────
  const saveTab = async (tabId = activeTab) => {
    if (SELF_MANAGED_TABS.has(tabId)) return;

    const tabState = tabStates[tabId];
    if (!tabState) return;

    // Special validation for payment tab
    if (tabId === "payment") {
      const pm = tabState.current?.paymentMethods;
      if (!pm?.enableOnline && !pm?.enableCod) {
        toast.error("Enable at least one payment method before saving");
        return;
      }
    }

    // Set saving loading state for this tab only
    setTabStates((prev) => ({
      ...prev,
      [tabId]: { ...prev[tabId], saving: true },
    }));

    try {
      const payload = getTabSavePayload(tabId, tabState.current);

      if (tabId === "brands") {
        await brandService.saveBrandsData(
          payload.brands || [],
          payload.brandsSection || {},
          user?.uid || ""
        );
      } else {
        await configureService.saveSiteConfig(payload, user?.uid || "");
      }

      // Update global context cache so visitor and customer pages see updates
      setConfig((prev) => ({ ...prev, ...payload }));

      // Snapshot saved state and clear dirty flag immediately
      setTabStates((prev) => {
        const updatedCurrent = prev[tabId]?.current || tabState.current;
        return {
          ...prev,
          [tabId]: {
            ...prev[tabId],
            saved: cloneDeep(updatedCurrent),
            isDirty: false,
            saving: false,
          },
        };
      });

      const tabObj = TABS.find((t) => t.id === tabId);
      toast.success(`${tabObj?.label || "Settings"} saved successfully`);
    } catch (err) {
      console.error(`Failed to save ${tabId}:`, err);
      toast.error(`Failed to save ${tabId} settings`);
      setTabStates((prev) => ({
        ...prev,
        [tabId]: { ...prev[tabId], saving: false },
      }));
    }
  };

  // ─── Discard / Cancel edits for active tab ──────────────────────────────────
  const cancelTab = (tabId = activeTab) => {
    if (SELF_MANAGED_TABS.has(tabId)) return;

    setTabStates((prev) => {
      const tabState = prev[tabId];
      if (!tabState) return prev;
      return {
        ...prev,
        [tabId]: {
          ...tabState,
          current: cloneDeep(tabState.saved),
          isDirty: false,
        },
      };
    });

    const tabObj = TABS.find((t) => t.id === tabId);
    toast.info(`${tabObj?.label || "Tab"} changes discarded`);
  };

  // ─── Smart beforeunload listener (warns ONLY when dirty) ────────────────────
  const anyTabDirty = useMemo(() => {
    return Object.values(tabStates).some((t) => Boolean(t.isDirty));
  }, [tabStates]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (anyTabDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [anyTabDirty]);

  // Active tab state helpers
  const activeTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];
  const isSelfManaged = SELF_MANAGED_TABS.has(activeTab);
  const activeTabState = tabStates[activeTab] || {};
  const activeDraft = activeTabState.current || {};
  const activeIsDirty = Boolean(activeTabState.isDirty);
  const activeSaving = Boolean(activeTabState.saving);

  // Tab props passed to children
  const tabProps = {
    draft: activeDraft,
    updateDraft: (patch) => updateTabDraft(activeTab, patch),
    markFieldSaved: (field, val) => markFieldSaved(activeTab, field, val),
    isDirty: activeIsDirty,
    saving: activeSaving,
    onSave: () => saveTab(activeTab),
    onCancel: () => cancelTab(activeTab),
    savedData: activeTabState.saved,
  };

  return (
    <div className="space-y-6 lg:space-y-8 px-4 md:px-0">
      {/* Header Action Row */}
      <Header
        title="Site Configuration"
        description="Manage company info, hero showcase banner, brands, collections, social links, legal pages, and SEO."
        buttonText={
          !isSelfManaged
            ? activeSaving
              ? "Saving..."
              : activeIsDirty
              ? `Save ${activeTabObj.label}`
              : "Saved"
            : undefined
        }
        buttonDisabledHint={
          activeTab === "payment" &&
          !activeDraft?.paymentMethods?.enableOnline &&
          !activeDraft?.paymentMethods?.enableCod
            ? "Enable at least one payment method before saving"
            : undefined
        }
        clickhandler={() => saveTab(activeTab)}
        disabled={
          activeSaving ||
          !activeIsDirty ||
          (activeTab === "payment" &&
            !activeDraft?.paymentMethods?.enableOnline &&
            !activeDraft?.paymentMethods?.enableCod)
        }
      />

      {/* Tab Navigation Wrapper */}
      <div className="bg-card md:border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        {/* Mobile Viewport Grid Selector */}
        <div className="block md:hidden p-3 bg-bg-surface border-b border-border-subtle">
          <div className="grid grid-cols-4 gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasDirty = Boolean(tabStates[tab.id]?.isDirty);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex flex-col items-center py-2.5 px-1 rounded-xl justify-center gap-1.5 text-center transition-all cursor-pointer border ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border-subtle bg-bg-base text-text-muted hover:text-text-base hover:bg-card-hover"
                  }`}
                >
                  {/* Unsaved indicator dot on tab */}
                  {hasDirty && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-xs"
                      title="Unsaved changes"
                    />
                  )}
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className="text-[9px] leading-tight font-extrabold truncate w-full px-0.5">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tablet / Desktop Viewport Tab Row */}
        <div className="hidden md:flex gap-1 overflow-x-auto border-b border-border-subtle [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1.5 bg-bg-surface">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const hasDirty = Boolean(tabStates[tab.id]?.isDirty);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
                  isActive
                    ? "border-primary text-primary bg-card rounded-t-xl"
                    : "border-transparent text-text-muted hover:text-text-base hover:bg-card-hover"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${
                    isActive ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {/* Unsaved badge dot */}
                {hasDirty && (
                  <span
                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30"
                    title="Unsaved changes"
                  >
                    Unsaved
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Tab Action Bar (Shows save / discard state for the active tab) */}
        {!isSelfManaged && (
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b transition-colors ${
              activeIsDirty
                ? "bg-amber-500/5 border-amber-500/20"
                : "bg-bg-surface/50 border-border-subtle"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {activeIsDirty ? (
                <>
                  <FaExclamationCircle className="text-amber-500 text-sm shrink-0" />
                  <span className="text-xs font-bold text-amber-500">
                    Changes in {activeTabObj.label} are unsaved
                  </span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-emerald-500 text-sm shrink-0" />
                  <span className="text-xs font-semibold text-text-muted">
                    {activeTabObj.label} is up to date with database
                  </span>
                </>
              )}
            </div>

            {activeIsDirty && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => cancelTab(activeTab)}
                  disabled={activeSaving}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle bg-card hover:bg-card-hover text-text-base text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Discard changes and restore last saved state"
                >
                  <FaUndo className="text-[10px]" />
                  <span>Discard</span>
                </button>
                <button
                  type="button"
                  onClick={() => saveTab(activeTab)}
                  disabled={
                    activeSaving ||
                    (activeTab === "payment" &&
                      !activeDraft?.paymentMethods?.enableOnline &&
                      !activeDraft?.paymentMethods?.enableCod)
                  }
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-compli text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {activeSaving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-compli border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-xs" />
                      <span>Save {activeTabObj.label}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-6 bg-card">
          {activeTab === "company" && <CompanyTab {...tabProps} />}
          {activeTab === "contact" && <ContactTab {...tabProps} />}
          {activeTab === "social" && <SocialTab {...tabProps} />}
          {activeTab === "banners" && <BannersTab />}
          {(activeTab === "showcase" || activeTab === "bengaltiles") && (
            <ShowcaseTab {...tabProps} />
          )}
          {activeTab === "brands" && <BrandsTab {...tabProps} />}
          {activeTab === "collections" && <CollectionsTab />}
          {activeTab === "legal" && <LegalTab {...tabProps} />}
          {activeTab === "seo" && <SeoTab {...tabProps} />}
          {activeTab === "payment" && <PaymentTab {...tabProps} />}
        </div>
      </div>
    </div>
  );
}

export default Configure;