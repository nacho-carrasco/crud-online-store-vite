// ============================================
// 4. SERVICIO DE ALMACENAMIENTO (src/services/StorageService.ts)
// ============================================
// Un "servicio" es una clase que se encarga de una tarea específica.
// Este servicio maneja todo lo relacionado con guardar y cargar datos del navegador

import { Product, CartItem } from '../types/index';

export class StorageService {
  // Constantes que definen las "llaves" para guardar datos en localStorage
  // "static readonly" significa que son constantes de la clase (no de instancias)
  private static readonly MUEBLES_KEY = 'muebles_key';
  private static readonly CARRITO_KEY = 'carrito_key';

  // Método para guardar productos en localStorage
  static saveProducts(products: Product[]): void {
    try {
      // JSON.stringify convierte el array de objetos en un texto (string)
      // localStorage solo puede guardar texto, no objetos directamente
      localStorage.setItem(this.MUEBLES_KEY, JSON.stringify(products));
    } catch (error) {
      // Si algo sale mal (ej: memoria llena), muestra el error en la consola
      console.error('Error saving products to localStorage:', error);
    }
  }

  // Método para cargar productos desde localStorage
  static loadProducts(): Product[] | null {
    try {
      // Intenta obtener el texto guardado con nuestra llave
      const data = localStorage.getItem(this.MUEBLES_KEY);
      
      // Si hay datos, los convierte de texto a objetos con JSON.parse
      // Si no hay datos, devuelve null
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // Si algo sale mal (ej: datos corruptos), devuelve null
      console.error('Error loading products from localStorage:', error);
      return null;
    }
  }

  // Método para guardar el carrito en localStorage
  static saveCart(cartItems: CartItem[]): void {
    try {
      localStorage.setItem(this.CARRITO_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Método para cargar el carrito desde localStorage
  static loadCart(): CartItem[] {
    try {
      const data = localStorage.getItem(this.CARRITO_KEY);
      // Si no hay datos, devuelve un array vacío (no null como en products)
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return []; // Array vacío en caso de error
    }
  }
}