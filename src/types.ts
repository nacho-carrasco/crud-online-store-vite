export interface Product {
  id: number;
  img: string;
  nombre: string;
  dimensiones: string;
  precio: number;
}

export interface CartItem extends Product {
  cantidad: number;
}

export interface AppState {
  products: Product[];
  cart: CartItem[];
  isLoading: boolean;
}