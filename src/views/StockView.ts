import { Product } from '../types/index';

/**
 * StockView - Vista para la gestión de inventario de productos
 * 
 * Esta clase maneja toda la representación visual del inventario de productos,
 * incluyendo la renderización de la lista, manejo de eventos de interacción
 * y estados visuales como carga y resaltado de productos.
 */
export class StockView {
  private container: HTMLElement;

  /**
   * Constructor de StockView
   * 
   * @param containerId - ID del elemento HTML donde se renderizará la lista de productos
   * 
   * Busca el elemento contenedor en el DOM y lo asigna a la propiedad container.
   * Si no encuentra el elemento, lanza un error descriptivo.
   */
  constructor(containerId: string) {
    // CORRECCIÓN: Buscar por ID en lugar de por clase
    const element = document.getElementById(containerId) as HTMLElement;
    if (!element) {
      throw new Error(`Container with ID "${containerId}" not found`);
    }
    this.container = element;
  }

  /**
   * Renderiza la lista completa de productos en el inventario
   * 
   * @param products - Array de productos a mostrar
   * 
   * Si no hay productos, muestra un estado vacío.
   * Si hay productos, limpia el contenedor y crea una tarjeta para cada producto.
   */
  render(products: Product[]): void {
    // Verificar si hay productos para mostrar
    if (!products || products.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Limpiar el contenedor de cualquier contenido previo
    this.container.innerHTML = '';
    
    // Crear y añadir una tarjeta para cada producto
    products.forEach(product => {
      const card = this.createStockCard(product);
      this.container.appendChild(card);
    });

    console.log(`Renderizados ${products.length} productos en el inventario`);
  }

  /**
   * Renderiza el estado vacío cuando no hay productos en el inventario
   * 
   * Muestra un mensaje amigable con un ícono y texto explicativo
   * para guiar al usuario sobre qué hacer cuando no hay productos.
   */
  private renderEmptyState(): void {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6d7175;">
        <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 16px; display: block;">
          inventory_2
        </span>
        <h3 style="margin-bottom: 8px;">No hay productos en el inventario</h3>
        <p>Haz clic en "Añadir producto" para comenzar a gestionar tu stock.</p>
      </div>
    `;
  }

  /**
   * Crea una tarjeta HTML individual para un producto del inventario
   * 
   * @param product - Objeto producto con todos sus datos
   * @returns HTMLElement - Elemento article con toda la estructura de la tarjeta
   * 
   * La tarjeta incluye:
   * - Imagen del producto con fallback a imagen por defecto
   * - Información del producto (nombre, ID, dimensiones, archivo de imagen)
   * - Precio formateado
   * - Botones de acción (editar y eliminar)
   */
  private createStockCard(product: Product): HTMLElement {
    const article = document.createElement('article');
    article.className = 'stock-product-card';
    // Añadir atributo data para identificar el producto
    article.setAttribute('data-product-id', product.id.toString());
    
    // Estructura HTML completa de la tarjeta de producto
    article.innerHTML = `
      <figure class="stock-product-card--image">
          <img src="../assets/images/${product.img}" 
               alt="${product.nombre}"
               onerror="this.src='../assets/images/default-img.jpg'">
      </figure>
      <div class="stock-product-car--info-container">
          <div class="stock-product-car--data-container">
              <h3 class="product-card--name">${this.escapeHtml(product.nombre)}</h3>
              <p class="product-card--description">
                  <strong>ID:</strong> ${product.id}<br>
                  <strong>Dimensiones:</strong> ${this.escapeHtml(product.dimensiones)}<br>
                  <strong>Imagen:</strong> ${this.escapeHtml(product.img)}
              </p>
              <p class="product-card--price">${product.precio.toFixed(2)}€</p>
          </div>
          <div class="stock-product-card--buttons-container">
              <button class="btn-neutral btn-edit" 
                      data-id="${product.id}"
                      title="Editar ${this.escapeHtml(product.nombre)}">
                  <span class="material-symbols-outlined">edit</span> 
                  Editar producto
              </button>
              <button class="btn-delete" 
                      data-id="${product.id}"
                      title="Eliminar ${this.escapeHtml(product.nombre)}">
                  <span class="material-symbols-outlined">delete</span> 
                  Eliminar producto
              </button>
          </div>
      </div>
    `;

    return article;
  }

  /**
   * Escapa caracteres HTML especiales para prevenir ataques XSS
   * 
   * @param text - Texto a escapar
   * @returns string - Texto con caracteres HTML escapados
   * 
   * Convierte caracteres como <, >, & en sus entidades HTML correspondientes
   * para prevenir la inyección de código malicioso.
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Conecta los eventos de clic para editar productos
   * 
   * @param handler - Función que se ejecutará cuando se haga clic en editar
   * 
   * Utiliza delegación de eventos en el contenedor para manejar todos los clics
   * en botones de editar, extrayendo el ID del producto del atributo data-id.
   */
  bindEditEvent(handler: (productId: number) => void): void {
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      // Buscar el botón de editar más cercano (por si se hace clic en el ícono)
      const button = target.closest('.btn-edit') as HTMLButtonElement;
      
      if (button) {
        event.preventDefault();
        event.stopPropagation();
        
        // Extraer el ID del producto del atributo data-id
        const productId = parseInt(button.getAttribute('data-id') || '0');
        if (productId > 0) {
          console.log(`Edit button clicked for product ID: ${productId}`);
          handler(productId);
        } else {
          console.error('Invalid product ID for edit action');
        }
      }
    });
  }

  /**
   * Conecta los eventos de clic para eliminar productos
   * 
   * @param handler - Función que se ejecutará cuando se haga clic en eliminar
   * 
   * Similar al evento de editar, pero para el botón de eliminar.
   * Maneja la delegación de eventos y extrae el ID del producto.
   */
  bindDeleteEvent(handler: (productId: number) => void): void {
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      // Buscar el botón de eliminar más cercano
      const button = target.closest('.btn-delete') as HTMLButtonElement;
      
      if (button) {
        event.preventDefault();
        event.stopPropagation();
        
        // Extraer el ID del producto del atributo data-id
        const productId = parseInt(button.getAttribute('data-id') || '0');
        if (productId > 0) {
          console.log(`Delete button clicked for product ID: ${productId}`);
          handler(productId);
        } else {
          console.error('Invalid product ID for delete action');
        }
      }
    });
  }

  /**
   * Conecta el evento de clic para añadir nuevo producto
   * 
   * @param handler - Función que se ejecutará cuando se haga clic en añadir producto
   * 
   * CORREGIDO: Busca el ID correcto y añade fallbacks
   */
  bindAddProductEvent(handler: () => void): void {
    // Intentar múltiples IDs para mayor compatibilidad
    const possibleIds = ['add-product-btn', 'crearProductoModal'];
    let addButton: HTMLElement | null = null;
    
    for (const id of possibleIds) {
      addButton = document.getElementById(id);
      if (addButton) {
        console.log(`Found add button with ID: ${id}`);
        break;
      }
    }
    
    if (addButton) {
      addButton.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Add product button clicked');
        handler();
      });
      
      console.log('Add product event listener bound successfully');
    } else {
      console.error('Add product button not found. Searched for IDs:', possibleIds);
      
      // Fallback: buscar por clase
      const fallbackButton = document.querySelector('.btn-primary') as HTMLElement;
      if (fallbackButton && fallbackButton.textContent?.includes('Añadir')) {
        console.log('Using fallback button selector');
        fallbackButton.addEventListener('click', (event) => {
          event.preventDefault();
          handler();
        });
      }
    }
  }

  /**
   * Resalta temporalmente un producto específico
   * 
   * @param productId - ID del producto a resaltar
   * 
   * Útil para dar feedback visual después de operaciones como añadir o editar.
   * Aplica efectos de transform y sombra, que se remueven automáticamente
   * después de 2 segundos.
   */
  highlightProduct(productId: number): void {
    const card = this.container.querySelector(`[data-product-id="${productId}"]`) as HTMLElement;
    if (card) {
      // Aplicar efectos visuales de resaltado
      card.style.transform = 'scale(1.02)';
      card.style.boxShadow = '0 8px 25px rgba(0, 128, 96, 0.15)';
      card.style.transition = 'all 0.3s ease';
      
      // Remover el resaltado después de 2 segundos
      setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
      }, 2000);
    }
  }

  /**
   * Muestra un indicador de carga mientras se procesan datos
   * 
   * Reemplaza el contenido del contenedor con un spinner animado
   * y mensaje de carga. Incluye CSS inline para la animación.
   */
  showLoading(): void {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="border: 3px solid #f3f3f3; border-top: 3px solid #008060; 
                    border-radius: 50%; width: 40px; height: 40px; 
                    animation: spin 1s linear infinite; margin: 0 auto 16px;">
        </div>
        <p>Cargando productos...</p>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }

  /**
   * Obtiene el número total de productos mostrados actualmente
   * 
   * @returns number - Cantidad de tarjetas de productos en el contenedor
   * 
   * Útil para validaciones o para mostrar contadores de productos.
   */
  getProductCount(): number {
    return this.container.querySelectorAll('.stock-product-card').length;
  }
}