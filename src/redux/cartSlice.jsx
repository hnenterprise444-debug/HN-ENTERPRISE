import { createSlice } from "@reduxjs/toolkit";

// Helper to retrieve the current active user ID from stored user session
const getActiveUserId = () => {
    try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            return parsed?.user?.uid || parsed?.uid || null;
        }
    } catch {
        return null;
    }
    return null;
};

/**
 * Returns a user-scoped storage key.
 * Logged-in users get `cart_<uid>`, unauthenticated guests get `cart_guest`.
 */
export const getCartStorageKey = (uid) => {
    return uid ? `cart_${uid}` : 'cart_guest';
};

/**
 * Loads the cart items belonging strictly to the specified user (or guest).
 */
export const loadCartFromStorage = (uid) => {
    try {
        const targetUid = uid !== undefined ? uid : getActiveUserId();
        const key = getCartStorageKey(targetUid);
        const saved = localStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved) || [];
        }
        // Fallback for guest sessions or legacy key
        if (!targetUid) {
            const legacy = localStorage.getItem('cart');
            if (legacy) return JSON.parse(legacy) || [];
        }
    } catch (err) {
        console.warn("Failed to load cart from storage:", err);
    }
    return [];
};

/**
 * Persists the cart items to the user's isolated storage key.
 */
export const saveCartToStorage = (cart, uid) => {
    try {
        const targetUid = uid !== undefined ? uid : getActiveUserId();
        const key = getCartStorageKey(targetUid);
        localStorage.setItem(key, JSON.stringify(cart || []));
        if (!targetUid) {
            localStorage.setItem('cart', JSON.stringify(cart || []));
        }
    } catch (err) {
        console.warn("Failed to save cart to storage:", err);
    }
};

const initialState = loadCartFromStorage();

// Helper to determine if two selectedVariant attribute sets match
const areVariantsEqual = (v1, v2) => {
    if (!v1 && !v2) return true;
    if (!v1 || !v2) return false;
    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => v1[key] === v2[key]);
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart(state, action) {
            const newCart = action.payload || [];
            saveCartToStorage(newCart);
            return newCart;
        },
        addToCart(state, action) {
            const newItem = action.payload;
            const existingIndex = state.findIndex(item => 
                item.id === newItem.id && 
                areVariantsEqual(item.selectedVariant, newItem.selectedVariant)
            );
            if (existingIndex >= 0) {
                state[existingIndex].quantity += Number(newItem.quantity || 1);
            } else {
                state.push({
                    ...newItem,
                    quantity: Number(newItem.quantity || 1)
                });
            }
            saveCartToStorage(state);
        },
        updateCartQuantity(state, action) {
            const { id, selectedVariant, quantity } = action.payload;
            const index = state.findIndex(item => 
                item.id === id && 
                areVariantsEqual(item.selectedVariant, selectedVariant)
            );
            if (index >= 0) {
                state[index].quantity = Math.max(1, quantity);
            }
            saveCartToStorage(state);
        },
        deleteFromCart(state, action) {
            const target = action.payload;
            const updated = state.filter(item => 
                !(item.id === target.id && areVariantsEqual(item.selectedVariant, target.selectedVariant))
            );
            saveCartToStorage(updated);
            return updated;
        },
        clearCart(state) {
            state.length = 0;
            const targetUid = getActiveUserId();
            localStorage.removeItem(getCartStorageKey(targetUid));
            localStorage.removeItem('cart');
            localStorage.removeItem('cart_guest');
        }
    }
});

export const { setCart, addToCart, updateCartQuantity, deleteFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;