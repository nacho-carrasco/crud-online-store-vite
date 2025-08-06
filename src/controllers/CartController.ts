import { CartModel } from '../models/CartModel';
import { ProductService } from '../services/ProductService';
import { CartView } from '../views/CartView';
import { StorageService } from '../services/StorageService';
import { CartItem } from '../types/index';

export class CartController {
  private cartModel: CartModel;
  private productService: ProductService;
  private cartView: CartView | null = null;

  constructor(cartModel: CartModel, productService: ProductService) {
    this.cartModel = cartModel;
    this.productService = productService;
    this.loadCartFromStorage();
  }

  setView(view: CartView): void {
    this.cartView = view;
    this.cartView.bindRemoveItemEvent(this.handleRemoveFromCart.bind(this));
  }

  async initialize(): Promise<void> {
    if (!this.cartView) {
      console.log('CartView not initialized, skipping cart loading');
      return;
    }

    this.updateView();
    
    // Corregido: Usar Event en lugar de CustomEvent
    document.addEventListener('addToCart', this.handleAddToCartEvent.bind(this));
  }

  // Corregido: Cambiar el tipo del parámetro
  private async handleAddToCartEvent(event: Event): Promise<void> {
    const customEvent = event as CustomEvent;
    const { productId } = customEvent.detail;
    await this.addToCart(productId);
  }

  async addToCart(productId: number): Promise<void> {
    try {
      const product = await this.productService.getProductById(productId);
      
      if (!product) {
        console.error(`Product with ID ${productId} not found`);
        return;
      }

      const success = this.cartModel.addItem(product);
      
      if (success) {
        this.saveCartToStorage();
        this.updateView();
        console.log(`Producto ${product.nombre} añadido al carrito`);
      } else {
        alert('El producto ya está en el carrito');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  }

  private handleRemoveFromCart(productId: number): void {
    const success = this.cartModel.removeItem(productId);
    
    if (success) {
      this.saveCartToStorage();
      this.updateView();
      console.log(`Producto con ID ${productId} eliminado del carrito`);
    }
  }

  private updateView(): void {
    if (!this.cartView) return;
    
    const items = this.cartModel.getItems();
    const total = this.cartModel.getTotalPrice();
    this.cartView.render(items, total);
  }

  private loadCartFromStorage(): void {
    const savedCart = StorageService.loadCart();
    this.cartModel.setItems(savedCart);
  }

  private saveCartToStorage(): void {
    const items = this.cartModel.getItems();
    StorageService.saveCart(items);
  }
}