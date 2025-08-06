// ============================================
// 7. VISTA DEL CARRITO (src/views/CartView.ts)
// ============================================
// Esta vista maneja cómo se muestra el carrito de compras

import { CartItem } from '../types/index';

export class CartView {
  // Dos contenedores: uno para la lista de productos y otro para el total
  private container: HTMLElement;
  private totalContainer: HTMLElement;

  // Constructor que recibe los IDs de ambos contenedores
  constructor(containerId: string, totalContainerId: string) {
    const element = document.getElementById(containerId);
    const totalElement = document.getElementById(totalContainerId);
    
    // Verifica que ambos elementos existan
    if (!element || !totalElement) {
      throw new Error(`Cart containers not found`);
    }
    
    this.container = element;
    this.totalContainer = totalElement;
  }

  // Método principal para renderizar el carrito completo
  render(cartItems: CartItem[], totalPrice: number): void {
    // Renderiza la lista de productos
    this.renderItems(cartItems);
    
    // Renderiza el precio total
    this.renderTotal(totalPrice);
  }

  // Método privado para renderizar solo la lista de productos
  private renderItems(cartItems: CartItem[]): void {
    // Si el carrito está vacío
    if (!cartItems || cartItems.length === 0) {
      this.container.innerHTML = '<p style="color:peru;">No hay productos en el carrito</p>';
      return;
    }

    // Limpia el contenedor
    this.container.innerHTML = '';
    
    // Crea un elemento para cada producto en el carrito
    cartItems.forEach(item => {
      const cartItem = this.createCartItem(item);
      this.container.appendChild(cartItem);
    });

    console.log(`Renderizados ${cartItems.length} items en el carrito`);
  }

  // Método privado para crear el HTML de un item del carrito
  private createCartItem(item: CartItem): HTMLElement {
    const article = document.createElement('article');
    article.className = 'cart-list--list-item';
    
    // Template del item del carrito
    article.innerHTML = `
      <div class="list-item--info">
        <div class="list-item--info--name">${item.nombre}</div>
        <div class="list-item--info--description">Cantidad: ${item.cantidad}</div>
        <div class="list-item--info--price">${item.precio.toFixed(2)}€</div>
      </div>
      <div class="list-item--action">
        <button class="btn-ghost btn-square-32px btn-remove" data-id="${item.id}">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    `;

    return article;
  }

  // Método privado para actualizar solo el precio total
  private renderTotal(totalPrice: number): void {
    // toFixed(2) asegura que siempre muestre 2 decimales
    this.totalContainer.innerHTML = `${totalPrice.toFixed(2)}€`;
  }

  // Método para conectar los clicks de "eliminar" con una función
  bindRemoveItemEvent(handler: (productId: number) => void): void {
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.btn-remove') as HTMLButtonElement;
      
      if (button) {
        const productId = parseInt(button.getAttribute('data-id') || '0');
        if (productId > 0) {
          handler(productId);
        }
      }
    });
  }
}