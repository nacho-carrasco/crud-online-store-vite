// ============================================
// 5. SERVICIO DE PRODUCTOS (src/services/ProductService.ts)
// ============================================
// Este servicio maneja toda la lógica relacionada con obtener y gestionar productos

import { Product } from '../types/index';
import { ProductModel } from '../models/ProductModel';
import { StorageService } from './StorageService';
import { mueblesCargaManual } from '../data/initialData';

export class ProductService {
  // Método asíncrono (async) para obtener todos los productos
  // "async" significa que puede tardar un poco y no bloquea el resto del código
  async getAllProducts(): Promise<Product[]> {
    // Promise es como una "promesa" de que eventualmente tendremos datos
    return new Promise((resolve) => {
      // Primero intenta cargar productos guardados
      const savedProducts = StorageService.loadProducts();
      
      if (savedProducts) {
        // Si encuentra productos guardados, los devuelve
        console.log('Cargando productos desde LocalStorage');
        resolve(savedProducts);
      } else {
        // Si no hay productos guardados, usa los datos iniciales
        console.log('No hay productos en LocalStorage, cargando datos iniciales');
        
        // Convierte cada objeto de datos iniciales en un ProductModel
        const initialProducts = mueblesCargaManual.map(ProductModel.fromJSON);
        
        // Convierte los ProductModel de vuelta a objetos planos para guardar
        const productsData = initialProducts.map(p => p.toJSON());
        
        // Guarda los productos iniciales para la próxima vez
        StorageService.saveProducts(productsData);
        
        // Devuelve los productos
        resolve(productsData);
      }
    });
  }

  // Método para obtener UN producto específico por su ID
  async getProductById(id: number): Promise<Product | null> {
    // Primero obtiene TODOS los productos
    const products = await this.getAllProducts();
    
    // Busca el producto con el ID específico
    // Si no lo encuentra, devuelve null
    return products.find(p => p.id === id) || null;
  }

  // Método para guardar una lista de productos
  async saveProducts(products: Product[]): Promise<void> {
    return new Promise((resolve) => {
      // Usa el StorageService para guardar
      StorageService.saveProducts(products);
      resolve(); // Indica que terminó
    });
  }
}