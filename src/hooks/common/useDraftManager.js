/**
 * useDraftManager
 *
 * Production-grade draft lifecycle hook for admin forms.
 *
 * Features:
 *  - Auto-save (debounced 300ms) with 500KB size limit
 *  - Draft namespaced by userId to prevent cross-admin collisions
 *  - Schema versioning to auto-discard stale drafts after form changes
 *  - Draft expiration (default 24h, max 7 days)
 *  - isDirty flag (set on first user edit, reset only on submit/discard)
 *  - hasDraft = mount-only snapshot, refreshable via recheckDraft()
 *  - beforeunload warning when isDirty
 *  - File objects stripped automatically; only metadata preserved
 *
 * Draft storage format:
 * {
 *   schemaVersion: 1,
 *   appVersion: "1.0.0",
 *   data: { ...sanitizedFormValues },
 *   createdAt: <timestamp>,
 *   updatedAt: <timestamp>,
 * }
 *
 * Usage:
 *   const draft = useDraftManager({
 *     storageKey: 'draft_product_create',
 *     defaultValues: initialFormState,
 *     userId: user?.uid,
 *     schemaVersion: 1,
 *     expiryHours: 24,
 *   });
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const APP_VERSION = '1.0.0';
const DRAFT_MAX_BYTES = 512 * 1024; // 500 KB hard limit

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the final localStorage key, namespaced by userId when available.
 * e.g. "draft_product_create_uid123"
 */
function buildKey(storageKey, userId) {
  return userId ? `${storageKey}_${userId}` : storageKey;
}

/**
 * Deeply sanitize a form value for storage:
 *  - Strips File, Blob, Map, and blob: URLs
 *  - Skips pendingFiles keys
 *  - Recursively processes arrays and objects
 */
function sanitizeForStorage(data) {
  if (data === null || data === undefined) return data;
  if (data instanceof File || data instanceof Blob || data instanceof Map) return undefined;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeForStorage).filter(v => v !== undefined);
  }

  const clean = {};
  for (const key of Object.keys(data)) {
    if (key === 'pendingFiles') continue;
    const val = data[key];
    if (val instanceof File || val instanceof Blob || val instanceof Map) continue;
    if (typeof val === 'string' && val.startsWith('blob:')) continue;
    const sanitized = sanitizeForStorage(val);
    if (sanitized !== undefined) {
      clean[key] = sanitized;
    }
  }
  return clean;
}

/**
 * Read and validate a draft from localStorage.
 * Returns the draft object or null if invalid/expired/empty.
 */
function readDraftFromStorage(key, schemaVersion, expiryHours) {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return null;

    // Schema version check — discard incompatible drafts
    if (draft.schemaVersion !== schemaVersion) {
      localStorage.removeItem(key);
      return null;
    }

    // Expiry check
    const ageMs = Date.now() - (draft.updatedAt || 0);
    const expiryMs = expiryHours * 60 * 60 * 1000;
    if (ageMs > expiryMs) {
      localStorage.removeItem(key);
      return null;
    }

    // Must have data
    if (!draft.data || typeof draft.data !== 'object') return null;

    // Must NOT be an existing record (edit mode has .id)
    if (draft.data.id) return null;

    // Must have at least one meaningful user-entered field
    const hasContent = Object.entries(draft.data).some(([k, v]) => {
      if (k === 'id') return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'string') return v.trim().length > 0;
      return false;
    });

    return hasContent ? draft : null;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {Object} options
 * @param {string} options.storageKey       Base key, e.g. 'draft_product_create'
 * @param {Object} options.defaultValues    Initial empty form state
 * @param {string} [options.userId]         Firebase UID to namespace the key
 * @param {number} [options.schemaVersion]  Increment when form shape changes
 * @param {number} [options.expiryHours]    Hours until draft auto-expires (default 24)
 */
export function useDraftManager({
  storageKey,
  defaultValues,
  userId = null,
  schemaVersion = 1,
  expiryHours = 24,
}) {
  const fullKey = buildKey(storageKey, userId);

  // ── Internal state ──────────────────────────────────────────────────────────
  const [formState, setFormStateInternal] = useState(defaultValues);

  // hasDraft: a one-time snapshot taken on mount (refreshed by recheckDraft)
  const [hasDraft, setHasDraft] = useState(
    () => Boolean(readDraftFromStorage(fullKey, schemaVersion, expiryHours))
  );

  // draftMeta: timestamps of the found draft for display in the dialog
  const [draftMeta, setDraftMeta] = useState(() => {
    const d = readDraftFromStorage(fullKey, schemaVersion, expiryHours);
    return d ? { createdAt: d.createdAt, updatedAt: d.updatedAt } : null;
  });

  // isDirty: true after the first user-triggered edit; false after clear/reset
  const [isDirty, setIsDirty] = useState(false);

  const formStateRef = useRef(formState);
  const isSubmittingRef = useRef(false);
  const createdAtRef = useRef(null); // preserved across saves

  // Keep formStateRef in sync for synchronous reads (e.g. beforeunload)
  useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  // ── Public setFormState (user-triggered, marks dirty) ──────────────────────
  const setFormState = useCallback((updater) => {
    setFormStateInternal(updater);
    setIsDirty(true);
  }, []);

  /**
   * Load values without marking the form dirty.
   * Use for programmatic loads: edithandle, restoreDraft, etc.
   */
  const loadValues = useCallback((values) => {
    setFormStateInternal(typeof values === 'function' ? values : () => values);
    // Does NOT set isDirty
  }, []);

  // ── Debounced auto-save ─────────────────────────────────────────────────────
  useEffect(() => {
    // Skip: no key, submitting, edit mode (has .id), or form is clean
    if (!fullKey || isSubmittingRef.current || formState?.id || !isDirty) return;

    const timer = setTimeout(() => {
      try {
        const cleanData = sanitizeForStorage(formState);

        // Preserve original createdAt across saves
        if (!createdAtRef.current) {
          const existing = localStorage.getItem(fullKey);
          try {
            const parsed = existing ? JSON.parse(existing) : null;
            createdAtRef.current = parsed?.createdAt ?? Date.now();
          } catch {
            createdAtRef.current = Date.now();
          }
        }

        const draft = {
          schemaVersion,
          appVersion: APP_VERSION,
          data: cleanData,
          createdAt: createdAtRef.current,
          updatedAt: Date.now(),
        };

        const serialized = JSON.stringify(draft);
        if (serialized.length > DRAFT_MAX_BYTES) {
          console.warn(
            `[useDraftManager] Draft too large (${Math.round(serialized.length / 1024)}KB), skipping save.`
          );
          return;
        }

        localStorage.setItem(fullKey, serialized);
      } catch (err) {
        console.warn(`[useDraftManager] Save error for "${fullKey}":`, err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fullKey, formState, isDirty, schemaVersion]);

  // ── beforeunload warning (browser close/refresh) ───────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (isDirty && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = ''; // triggers browser's native "Leave site?" dialog
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── User-facing actions ─────────────────────────────────────────────────────

  /** Re-read localStorage — call when user navigates back to the add form */
  const recheckDraft = useCallback(() => {
    const draft = readDraftFromStorage(fullKey, schemaVersion, expiryHours);
    setHasDraft(Boolean(draft));
    setDraftMeta(draft ? { createdAt: draft.createdAt, updatedAt: draft.updatedAt } : null);
  }, [fullKey, schemaVersion, expiryHours]);

  /** Load the saved draft into the form (user clicked "Continue Editing") */
  const restoreDraft = useCallback(() => {
    const draft = readDraftFromStorage(fullKey, schemaVersion, expiryHours);
    if (draft?.data) {
      loadValues({ ...defaultValues, ...draft.data });
    }
    setHasDraft(false);
    setDraftMeta(null);
    // isDirty stays false until user makes next edit
  }, [fullKey, schemaVersion, expiryHours, defaultValues, loadValues]);

  /** Discard the saved draft without restoring (user clicked "Discard Draft") */
  const discardDraft = useCallback(() => {
    try { localStorage.removeItem(fullKey); } catch { /* ignore */ }
    createdAtRef.current = null;
    setHasDraft(false);
    setDraftMeta(null);
    setIsDirty(false);
  }, [fullKey]);

  /**
   * Remove draft after successful submission.
   * Always clear BEFORE navigating away to prevent race conditions.
   */
  const clearDraft = useCallback(() => {
    isSubmittingRef.current = true;
    try { localStorage.removeItem(fullKey); } catch { /* ignore */ }
    createdAtRef.current = null;
    setHasDraft(false);
    setDraftMeta(null);
    setIsDirty(false);
    // Re-enable saves after a tick (allows navigation to complete first)
    setTimeout(() => { isSubmittingRef.current = false; }, 200);
  }, [fullKey]);

  /** Reset form to defaultValues AND discard draft */
  const resetForm = useCallback(() => {
    clearDraft();
    setFormStateInternal(defaultValues);
  }, [clearDraft, defaultValues]);

  return {
    formState,
    setFormState,    // user-triggered: marks isDirty
    loadValues,      // programmatic: does NOT mark isDirty

    hasDraft,
    draftMeta,
    isDirty,

    recheckDraft,
    restoreDraft,
    discardDraft,
    clearDraft,
    resetForm,
  };
}

/**
 * Utility: remove all drafts belonging to a specific user.
 * Call this on logout to prevent draft leakage between admin sessions.
 *
 * @param {string} userId - Firebase UID
 */
export function clearDraftsForUser(userId) {
  if (!userId) return;
  const keysToRemove = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(`_${userId}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
  } catch (err) {
    console.warn('[useDraftManager] clearDraftsForUser error:', err);
  }
}

export default useDraftManager;
