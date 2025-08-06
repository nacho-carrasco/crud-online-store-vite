// ============================================
// 6. VISTA DE PRODUCTOS (src/views/ProductView.ts)
// ============================================
// Una "vista" es la parte que maneja cómo se VE la información en la pantalla.
// Es la "V" de MVC (Model-View-Controller)

import { Product } from '../types/index';

export class ProductView {
  // Variable que guarda referencia al elemento HTML donde mostraremos los productos
  private container: HTMLElement;

  // Constructor que recibe el ID del elemento HTML contenedor
  constructor(containerId: string) {
    // Busca el elemento en el HTML por su ID
    const element = document.getElementById(containerId);
    
    // Si no encuentra el elemento, lanza un error
    if (!element) {
      throw new Error(`Container with ID "${containerId}" not found`);
    }
    
    // Guarda la referencia al elemento
    this.container = element;
  }

  // Método principal para mostrar la lista de productos
  render(products: Product[]): void {
    // Si no hay productos o la lista está vacía
    if (!products || products.length === 0) {
      // Muestra un mensaje de "no hay productos"
      this.container.innerHTML = '<p style="color:peru; text-align:center;">No hay productos disponibles</p>';
      return; // Sale de la función
    }

    // Limpia el contenedor (elimina cualquier contenido anterior)
    this.container.innerHTML = '';
    
    // Recorre cada producto y crea su tarjeta visual
    products.forEach(product => {
      // Crea el elemento HTML para este producto
      const productCard = this.createProductCard(product);
      
      // Añade la tarjeta al contenedor
      this.container.appendChild(productCard);
    });

    // Muestra en consola cuántos productos se renderizaron
    console.log(`Renderizados ${products.length} productos`);
  }

  // Método privado para crear la tarjeta HTML de un producto
  private createProductCard(product: Product): HTMLElement {
    // Crea un elemento <article> (contenedor semántico)
    const article = document.createElement('article');
    
    // Le asigna la clase CSS para el estilo
    article.className = 'product-card';
    
    // Define todo el HTML interno de la tarjeta
    // Usa template literals (comillas invertidas) para insertar variables con ${}
    article.innerHTML = `
      <figure class="product-card--image">
        <img src="../assets/images/${product.img}" alt="${product.nombre}">
      </figure>
      <div class="product-card--info--container">
        <h3 class="product-card--name">${product.nombre}</h3>
        <p class="product-card--description">Dimensiones: ${product.dimensiones}</p>
        <p class="product-card--price">${product.precio.toFixed(2)}€</p>
        <button class="product-card--add-btn btn-primary" data-id="${product.id}">
          <span class="material-symbols-outlined">shopping_cart</span> 
          Añadir al carrito
        </button>
      </div>
    `;

    // Devuelve el elemento completo
    return article;
  }

  // Método para "conectar" los eventos de click con una función
  bindAddToCartEvent(handler: (productId: number) => void): void {
    // Añade un event listener al contenedor principal
    this.container.addEventListener('click', (event) => {
      // event.target es el elemento exacto que recibió el click
      const target = event.target as HTMLElement;
      
      // Busca el botón más cercano (en caso de que se haga click en el ícono)
      const button = target.closest('.product-card--add-btn') as HTMLButtonElement;
      
      // Si se encontró un botón
      if (button) {
        // Obtiene el ID del producto desde el atributo data-id
        const productId = parseInt(button.getAttribute('data-id') || '0');
        
        // Si el ID es válido, llama a la función que se pasó como parámetro
        if (productId > 0) {
          handler(productId);
        }
      }
    });
  }
}