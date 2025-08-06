// Version del controlador que usa Redux para manejar el carrito

import { store } from '../store/store'
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../slices/cartSlice'
import { CartView } from '../views/CartView'
import type { Product } from '../types/index'

export class CartControllerRedux {
  private cartView: CartView | null = null
  private unsubscribe: (() => void) | null = null

  setView(view: CartView): void {
    this.cartView = view
    this.cartView.bindRemoveItemEvent(this.handleRemoveFromCart.bind(this))
  }

  async initialize(): Promise<void> {
    if (!this.cartView) {
      console.log('CartView not initialized, skipping cart loading');
      return;
    }

    // Renderizar estado inicial
    this.updateView()
    
    // Suscribirse a cambios en el store
    this.unsubscribe = store.subscribe(() => {
      this.updateView()
    })
    
    // Escuchar eventos de añadir al carrito
    document.addEventListener('addToCart', this.handleAddToCartEvent.bind(this))
    
    console.log('CartControllerRedux initialized successfully');
  }

  private updateView(): void {
    if (!this.cartView) return
    
    const state = store.getState()
    const { items, totalPrice } = state.cart
    
    this.cartView.render(items, totalPrice)
  }

  private async handleAddToCartEvent(event: Event): Promise<void> {
    const customEvent = event as CustomEvent
    const { productId } = customEvent.detail
    
    // Obtener el producto del store
    const state = store.getState()
    const product = state.products.items.find(p => p.id === productId)
    
    if (product) {
      this.addToCart(product)
    } else {
      console.error(`Product with ID ${productId} not found in store`)
    }
  }

  addToCart(product: Product): void {
    try {
      store.dispatch(addToCart(product))
      console.log(`Producto ${product.nombre} añadido al carrito via Redux`)
    } catch (error) {
      console.error('Error adding product to cart via Redux:', error)
      alert('Error al añadir el producto al carrito')
    }
  }

  private handleRemoveFromCart(productId: number): void {
    try {
      store.dispatch(removeFromCart(productId))
      console.log(`Producto con ID ${productId} eliminado del carrito via Redux`)
    } catch (error) {
      console.error('Error removing product from cart via Redux:', error)
      alert('Error al eliminar el producto del carrito')
    }
  }

  updateItemQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.handleRemoveFromCart(productId)
      return
    }

    try {
      store.dispatch(updateQuantity({ id: productId, cantidad: quantity }))
      console.log(`Cantidad del producto ${productId} actualizada a ${quantity} via Redux`)
    } catch (error) {
      console.error('Error updating item quantity via Redux:', error)
      alert('Error al actualizar la cantidad')
    }
  }

  clearAllItems(): void {
    try {
      store.dispatch(clearCart())
      console.log('Carrito vaciado via Redux')
    } catch (error) {
      console.error('Error clearing cart via Redux:', error)
      alert('Error al vaciar el carrito')
    }
  }

  // Métodos de utilidad para obtener información del carrito
  getCartItems(): import('../types/index').CartItem[] {
    const state = store.getState()
    return state.cart.items
  }

  getTotalPrice(): number {
    const state = store.getState()
    return state.cart.totalPrice
  }

  getItemCount(): number {
    const state = store.getState()
    return state.cart.items.length
  }

  getTotalQuantity(): number {
    const state = store.getState()
    return state.cart.items.reduce((total, item) => total + item.cantidad, 0)
  }

  // Cleanup: desuscribirse cuando el controlador se destruye
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    
    document.removeEventListener('addToCart', this.handleAddToCartEvent.bind(this))
    console.log('CartControllerRedux destroyed and cleaned up')
  }
}