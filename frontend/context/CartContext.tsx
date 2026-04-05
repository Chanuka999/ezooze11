
import React, { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { CartItem, Product } from '../types';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product, size: string, color: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string | number, selectedSize: string, selectedColor: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string | number, selectedSize: string, selectedColor: string, quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, color } = action.payload;
      const existingItem = state.items.find(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === product.id && item.selectedSize === size && item.selectedColor === color
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...product, quantity: 1, selectedSize: size, selectedColor: color }],
      };
    }
    case 'REMOVE_ITEM': {
        const { id, selectedSize, selectedColor } = action.payload;
        return {
            ...state,
            items: state.items.filter(
                (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
            ),
        };
    }
    case 'UPDATE_QUANTITY': {
      const { id, selectedSize, selectedColor, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => !(item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
            ? { ...item, quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartContext = createContext<{ state: CartState; dispatch: Dispatch<CartAction> }>({
  state: initialState,
  dispatch: () => null,
});

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
};
