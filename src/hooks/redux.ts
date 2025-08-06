// Utilidades para usar Redux en aplicaciones vanilla TypeScript

import type { RootState, AppDispatch } from '../store/store'
import { store } from '../store/store'
import { Product, CartItem } from '../types/index'

// Definir tipos específicos para el estado de Redux
interface ProductState {
  items: Product[]
  loading: boolean
  error: string | null
}

interface CartState {
  items: CartItem[]
  totalPrice: number
}

// Tipo específico para nuestro RootState
interface AppRootState {
  products: ProductState
  cart: CartState
}

/**
 * Hook personalizado para obtener el dispatch del store
 * Equivalente a useDispatch pero para vanilla JS/TS
 */
export const getAppDispatch = (): AppDispatch => {
  return store.dispatch
}

/**
 * Hook personalizado para seleccionar estado del store
 * Equivalente a useSelector pero para vanilla JS/TS
 */
export const selectFromStore = <T>(selector: (state: AppRootState) => T): T => {
  return selector(store.getState() as AppRootState)
}

/**
 * Función para suscribirse a cambios en el store
 * Equivalente a useSelector con subscription
 */
export const subscribeToStore = (
  callback: (state: AppRootState) => void
): (() => void) => {
  return store.subscribe(() => callback(store.getState() as AppRootState))
}

/**
 * Hook personalizado para suscribirse a una parte específica del estado
 */
export const subscribeToSelector = <T>(
  selector: (state: AppRootState) => T,
  callback: (value: T) => void
): (() => void) => {
  let currentValue = selector(store.getState() as AppRootState)
  
  return store.subscribe(() => {
    const newValue = selector(store.getState() as AppRootState)
    if (newValue !== currentValue) {
      currentValue = newValue
      callback(newValue)
    }
  })
}

// Selectores comunes para facilitar el acceso
export const commonSelectors = {
  // Productos
  getAllProducts: (state: AppRootState) => state.products.items,
  getProductsLoading: (state: AppRootState) => state.products.loading,
  getProductsError: (state: AppRootState) => state.products.error,
  getProductById: (id: number) => (state: AppRootState) => 
    state.products.items.find(p => p.id === id),
  
  // Carrito
  getCartItems: (state: AppRootState) => state.cart.items,
  getCartTotal: (state: AppRootState) => state.cart.totalPrice,
  getCartCount: (state: AppRootState) => state.cart.items.length,
  isInCart: (id: number) => (state: AppRootState) => 
    state.cart.items.some(item => item.id === id),
}

// Acciones comunes para facilitar el dispatch
export const dispatchActions = {
  // Productos
  fetchProducts: () => {
    const { fetchProducts } = require('../slices/productSlice')
    return store.dispatch(fetchProducts())
  },
  
  addProduct: (product: any) => {
    const { addProduct } = require('../slices/productSlice')
    return store.dispatch(addProduct(product))
  },
  
  updateProduct: (product: any) => {
    const { updateProduct } = require('../slices/productSlice')
    return store.dispatch(updateProduct(product))
  },
  
  deleteProduct: (id: number) => {
    const { deleteProduct } = require('../slices/productSlice')
    return store.dispatch(deleteProduct(id))
  },
  
  // Carrito
  addToCart: (product: any) => {
    const { addToCart } = require('../slices/cartSlice')
    return store.dispatch(addToCart(product))
  },
  
  removeFromCart: (id: number) => {
    const { removeFromCart } = require('../slices/cartSlice')
    return store.dispatch(removeFromCart(id))
  },
  
  clearCart: () => {
    const { clearCart } = require('../slices/cartSlice')
    return store.dispatch(clearCart())
  }
}