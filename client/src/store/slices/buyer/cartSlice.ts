import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Cart Slice - Manages cart item count (lightweight state)
 * Full cart data is managed by React Query
 */

interface CartState {
  itemCount: number;
}

const initialState: CartState = {
  itemCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload;
    },
    incrementCartCount: (state) => {
      state.itemCount += 1;
    },
    decrementCartCount: (state) => {
      if (state.itemCount > 0) {
        state.itemCount -= 1;
      }
    },
    clearCartCount: (state) => {
      state.itemCount = 0;
    },
  },
});

export const { setCartCount, incrementCartCount, decrementCartCount, clearCartCount } =
  cartSlice.actions;
export default cartSlice.reducer;
