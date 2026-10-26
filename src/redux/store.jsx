import { configureStore } from '@reduxjs/toolkit' 
import cartSlice from './cartSlice'

export const store = configureStore({
  reducer: {
    cart: cartSlice,
  },
  devTools: true
})

// Subscribe to store updates to keep localStorage in sync in real time
store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem('cart', JSON.stringify(state.cart || []));
  } catch (err) {
    console.warn("Failed to sync cart to localStorage:", err);
  }
});