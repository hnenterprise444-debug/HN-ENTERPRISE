import { useDraftManager, clearDraftsForUser } from './useDraftManager';

/**
 * useFormAutoSave (Array Destructuring Compatibility Hook)
 * Wraps useDraftManager to provide an array-destructurable return value:
 * [formState, setFormState, clearDraft, resetForm]
 *
 * @param {string} storageKey - localStorage key for saving draft
 * @param {Object} initialValue - Initial form state object
 * @param {Object} [options] - Options (debounceMs, userId, schemaVersion, etc.)
 * @returns {[Object, Function, Function, Function]} [formState, setFormState, clearDraft, resetForm]
 */
export function useFormAutoSave(storageKey, initialValue = {}, options = {}) {
    const { debounceMs, userId, schemaVersion = 1, expiryHours = 24 } = options || {};

    const draft = useDraftManager({
        storageKey,
        defaultValues: initialValue,
        userId,
        schemaVersion,
        expiryHours,
        debounceMs,
    });

    return [
        draft.formState,
        draft.setFormState,
        draft.clearDraft,
        draft.resetForm,
    ];
}

export { clearDraftsForUser };
export default useFormAutoSave;
