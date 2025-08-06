// ============================================
// 3. MODELO DEL CARRITO (src/models/CartModel.ts)
// ============================================
// Este modelo gestiona todo lo relacionado con el carrito de compras

import { Product, CartItem } from '../types/index';
import { StorageService } from '../services/StorageService';

export class CartModel {
  // Array privado que guarda todos los productos del carrito
  // "private" significa que solo esta clase puede acceder directamente a esta variable
  private items: CartItem[] = [];

  // Método para añadir un producto al carrito
  addItem(product: Product): boolean {
    // Busca si el producto ya existe en el carrito
    // find() recorre el array y devuelve el primer elemento que coincida
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      // Si ya existe, no lo añade y devuelve false
      return false;
    }
    
    // Si no existe, lo convierte en CartItem (añadiendo cantidad: 1)
    // Los "..." se llaman "spread operator" y copian todas las propiedades de product
    const cartItem: CartItem = { ...product, cantidad: 1 };
    
    // Añade el nuevo item al final del array
    this.items.push(cartItem);
    
    // Devuelve true para indicar que se añadió correctamente
    return true;
  }

  // Método para eliminar un producto del carrito
  removeItem(productId: number): boolean {
    // Guarda la longitud inicial del array
    const initialLength = this.items.length;
    
    // filter() crea un nuevo array con solo los elementos que cumplan la condición
    // En este caso, mantiene todos EXCEPTO el que tenga el ID que queremos eliminar
    this.items = this.items.filter(item => item.id !== productId);
    
    // Si la longitud cambió, significa que se eliminó algo
    return this.items.length < initialLength;
  }

  // Método para obtener todos los items del carrito
  getItems(): CartItem[] {
    // Devuelve una copia del array (no el original) para evitar modificaciones accidentales
    // [...this.items] es otra forma de usar el spread operator para copiar un array
    return [...this.items];
  }

  // Calcula el precio total de todos los productos en el carrito
  getTotalPrice(): number {
    // reduce() es un método que "reduce" un array a un solo valor
    // Toma cada item y suma (precio × cantidad) al total acumulado
    return this.items.reduce((total, item) => {
      return total + (item.precio * item.cantidad);
    }, 0); // El 0 es el valor inicial del total
  }

  // Devuelve cuántos productos diferentes hay en el carrito
  getItemCount(): number {
    return this.items.length;
  }

  // Vacía completamente el carrito
  clear(): void {
    this.items = [];
  }

  // Establece los items del carrito (útil para cargar desde localStorage)
  setItems(items: CartItem[]): void {
    // Crea una copia del array recibido
    this.items = [...items];
  }
}