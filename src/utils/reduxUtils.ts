// Utilidades para trabajar con Redux de forma más eficiente

import { Product, CartItem } from '../types/index';

// Tipos específicos para las acciones de Redux
export interface ProductActionPayload {
  product: Product;
}

export interface CartActionPayload {
  productId: number;
  product?: Product;
}

export interface LoadingActionPayload {
  isLoading: boolean;
}

// Tipos para los selectores de Redux
export interface RootState {
  products: Product[];
  cart: CartItem[];
  isLoading: boolean;
}

// Enum para los tipos de acciones
export enum ActionTypes {
  // Acciones de productos
  LOAD_PRODUCTS = 'products/load',
  ADD_PRODUCT = 'products/add',
  UPDATE_PRODUCT = 'products/update',
  DELETE_PRODUCT = 'products/delete',
  
  // Acciones del carrito
  ADD_TO_CART = 'cart/add',
  REMOVE_FROM_CART = 'cart/remove',
  CLEAR_CART = 'cart/clear',
  LOAD_CART = 'cart/load',
  
  // Acciones de estado global
  SET_LOADING = 'app/setLoading'
}

// Helper types para acciones
export interface BaseAction {
  type: string;
  payload?: any;
}

export interface ProductAction extends BaseAction {
  type: ActionTypes;
  payload: ProductActionPayload;
}

export interface CartAction extends BaseAction {
  type: ActionTypes;
  payload: CartActionPayload;
}

export interface LoadingAction extends BaseAction {
  type: ActionTypes.SET_LOADING;
  payload: LoadingActionPayload;
}

// Union type para todas las acciones posibles
export type AppAction = ProductAction | CartAction | LoadingAction;

// Utility functions para Redux
export const createAction = <T>(type: ActionTypes, payload: T): BaseAction => ({
  type,
  payload
});

// Selector helpers
export const selectProducts = (state: RootState): Product[] => state.products;
export const selectCart = (state: RootState): CartItem[] => state.cart;
export const selectIsLoading = (state: RootState): boolean => state.isLoading;
export const selectCartTotal = (state: RootState): number => 
  state.cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
export const selectCartItemCount = (state: RootState): number => state.cart.length;

// Helper para encontrar producto por ID
export const selectProductById = (state: RootState, id: number): Product | undefined =>
  state.products.find(product => product.id === id);

// Helper para verificar si un producto está en el carrito
export const selectIsInCart = (state: RootState, productId: number): boolean =>
  state.cart.some(item => item.id === productId);