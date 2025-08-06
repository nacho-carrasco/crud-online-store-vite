// Version del controlador que usa Redux en lugar del patrón tradicional

import { store } from '../store/store'
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../slices/productSlice'
import { addToCart } from '../slices/cartSlice'
import { ProductView } from '../views/ProductView'

export class ProductControllerRedux {
  private productView: ProductView | null = null

  setView(view: ProductView): void {
    this.productView = view
    this.productView.bindAddToCartEvent(this.handleAddToCart.bind(this))
  }

  async initialize(): Promise<void> {
    if (!this.productView) {
      console.log('ProductView not initialized, skipping product loading');
      return;
    }

    try {
      // Dispatch async thunk para cargar productos
      await store.dispatch(fetchProducts())
      
      // Obtener el estado actualizado
      const state = store.getState()
      
      // Renderizar productos en la vista
      this.productView.render(state.products.items)
      
      console.log(`ProductControllerRedux initialized with ${state.products.items.length} products`);
    } catch (error) {
      console.error('Error initializing ProductControllerRedux:', error);
    }
  }

  private handleAddToCart(productId: number): void {
    const state = store.getState()
    const product = state.products.items.find(p => p.id === productId)
    
    if (product) {
      // Dispatch acción para añadir al carrito
      store.dispatch(addToCart(product))
      console.log(`Producto ${product.nombre} añadido al carrito via Redux`);
    } else {
      console.error(`Product with ID ${productId} not found in Redux store`);
    }
  }

  // Métodos adicionales para gestión de productos (útiles para la página de stock)
  async addNewProduct(productData: Omit<import('../types/index').Product, 'id'>): Promise<void> {
    try {
      await store.dispatch(addProduct(productData))
      console.log('Producto añadido exitosamente via Redux');
    } catch (error) {
      console.error('Error adding product via Redux:', error);
      throw error;
    }
  }

  async updateExistingProduct(product: import('../types/index').Product): Promise<void> {
    try {
      await store.dispatch(updateProduct(product))
      console.log(`Producto ${product.id} actualizado exitosamente via Redux`);
    } catch (error) {
      console.error('Error updating product via Redux:', error);
      throw error;
    }
  }

  async deleteExistingProduct(productId: number): Promise<void> {
    try {
      await store.dispatch(deleteProduct(productId))
      console.log(`Producto ${productId} eliminado exitosamente via Redux`);
    } catch (error) {
      console.error('Error deleting product via Redux:', error);
      throw error;
    }
  }

  // Método para obtener el estado actual de productos
  getCurrentProducts(): import('../types/index').Product[] {
    const state = store.getState()
    return state.products.items
  }

  // Método para suscribirse a cambios en el store
  subscribeToStore(callback: () => void): () => void {
    return store.subscribe(callback)
  }
}