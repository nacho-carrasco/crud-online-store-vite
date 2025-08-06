import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartItem, Product } from '../types/index'
import { StorageService } from '../services/StorageService'

interface CartState {
  items: CartItem[]
  totalPrice: number
}

const initialState: CartState = {
  items: StorageService.loadCart(),
  totalPrice: 0
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (!existingItem) {
        const cartItem: CartItem = { ...action.payload, cantidad: 1 }
        state.items.push(cartItem)
        StorageService.saveCart(state.items)
      }
      
      state.totalPrice = state.items.reduce((total, item) => 
        total + (item.precio * item.cantidad), 0
      )
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      StorageService.saveCart(state.items)
      state.totalPrice = state.items.reduce((total, item) => 
        total + (item.precio * item.cantidad), 0
      )
    },
    updateQuantity: (state, action: PayloadAction<{id: number, cantidad: number}>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.cantidad = action.payload.cantidad
        StorageService.saveCart(state.items)
        state.totalPrice = state.items.reduce((total, item) => 
          total + (item.precio * item.cantidad), 0
        )
      }
    },
    clearCart: (state) => {
      state.items = []
      state.totalPrice = 0
      StorageService.saveCart([])
    }
  }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer