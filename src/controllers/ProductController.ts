
import { ProductService } from '../services/ProductService';
import { ProductView } from '../views/ProductView';

export class ProductController {
  // Referencias a los servicios que necesita
  private productService: ProductService;
  private productView: ProductView | null = null;

  // Constructor que recibe el servicio de productos
  constructor(productService: ProductService) {
    this.productService = productService;
  }

  // Método para asignar una vista a este controlador
  setView(view: ProductView): void {
    this.productView = view;
    
    // Conecta los eventos de la vista con los métodos de este controlador
    // Cuando alguien haga click en "añadir al carrito", se ejecutará handleAddToCart
    this.productView.bindAddToCartEvent(this.handleAddToCart.bind(this));
  }

  // Método para inicializar y cargar los productos
  async initialize(): Promise<void> {
    // Si no hay vista asignada, no hace nada
    if (!this.productView) {
      console.log('ProductView not initialized, skipping product loading');
      return;
    }

    try {
      // Obtiene todos los productos del servicio
      const products = await this.productService.getAllProducts();
      
      // Le dice a la vista que los muestre
      this.productView.render(products);
    } catch (error) {
      // Si algo sale mal, muestra el error
      console.error('Error initializing products:', error);
    }
  }

  // Método privado que maneja cuando alguien quiere añadir un producto al carrito
  private handleAddToCart(productId: number): void {
    // En lugar de manejar el carrito directamente aquí (lo que violaría la separación de responsabilidades),
    // emite un "evento personalizado" que otros controladores pueden escuchar
    
    // Crea un evento personalizado con los datos del producto
    const event = new CustomEvent('addToCart', { detail: { productId } });
    
    // Lo emite para que lo escuche el CartController
    document.dispatchEvent(event);
  }
}