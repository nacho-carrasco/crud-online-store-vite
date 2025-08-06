// ============================================
// CONTROLADOR PRINCIPAL CON REDUX (src/controllers/AppControllerRedux.ts)
// ============================================

import { Product } from '../types/index';
import { ProductView } from '../views/ProductView';
import { CartView } from '../views/CartView';
import { StockView } from '../views/StockView';
import { ModalService } from '../services/ModalService';
import { PWAService } from '../services/PWAService';

// Importar Redux utilities sin React
import { 
  getAppDispatch, 
  selectFromStore, 
  subscribeToSelector,
  commonSelectors,
  dispatchActions 
} from '../hooks/redux';

import { logger, generateProductId, validateProduct, showNotification } from '../utils/helpers';

export class AppControllerRedux {
  private productView: ProductView | null = null;
  private cartView: CartView | null = null;
  private stockView: StockView | null = null;
  private modalService: ModalService | null = null;
  private pwaService: PWAService;
  
  private unsubscribeCallbacks: (() => void)[] = [];

  constructor() {
    // Inicializar PWA sin botón de instalación automático
    this.pwaService = new PWAService({ showInstallButton: false });
    logger.info('AppControllerRedux initialized');
  }

  /**
   * Inicializa la aplicación Redux
   */
  async initialize(): Promise<void> {
    try {
      // Detectar qué página estamos cargando
      const isStockPage = this.isStockPage();
      const isMainPage = this.isMainPage();

      if (isMainPage) {
        await this.initializeMainPage();
      } else if (isStockPage) {
        await this.initializeStockPage();
      }

      // Cargar datos iniciales
      await this.loadInitialData();

      logger.info('AppControllerRedux initialized successfully');
    } catch (error) {
      logger.error('Error initializing AppControllerRedux:', error);
      throw error;
    }
  }

  /**
   * Inicializa la página principal (tienda)
   */
  private async initializeMainPage(): Promise<void> {
    try {
      // Inicializar vistas
      this.productView = new ProductView('productList');
      this.cartView = new CartView('cartList', 'totalPriceValue');

      // Configurar eventos
      this.bindMainPageEvents();

      // Suscribirse a cambios en el store
      this.subscribeToStoreChanges();

      logger.info('Main page initialized with Redux');
    } catch (error) {
      logger.error('Error initializing main page:', error);
      throw error;
    }
  }

  /**
   * Inicializa la página de gestión de stock
   */
  private async initializeStockPage(): Promise<void> {
    try {
      // Inicializar vistas y servicios
      this.stockView = new StockView('stockList');
      this.modalService = new ModalService();

      // Configurar eventos
      this.bindStockPageEvents();

      // Suscribirse a cambios en el store
      this.subscribeToStoreChanges();

      logger.info('Stock page initialized with Redux');
    } catch (error) {
      logger.error('Error initializing stock page:', error);
      throw error;
    }
  }

  /**
   * Carga los datos iniciales en Redux
   */
  private async loadInitialData(): Promise<void> {
    try {
      // Dispatch para cargar productos
      await dispatchActions.fetchProducts();
      
      logger.info('Initial data loaded in Redux store');
    } catch (error) {
      logger.error('Error loading initial data:', error);
      showNotification('Error al cargar los datos iniciales', 'error');
    }
  }

  /**
   * Configura eventos para la página principal
   */
  private bindMainPageEvents(): void {
    if (!this.productView || !this.cartView) return;

    // Evento para añadir al carrito
    this.productView.bindAddToCartEvent((productId) => {
      this.handleAddToCart(productId);
    });

    // Evento para eliminar del carrito
    this.cartView.bindRemoveItemEvent((productId) => {
      this.handleRemoveFromCart(productId);
    });

    logger.debug('Main page events bound');
  }

  /**
   * Configura eventos para la página de gestión de stock
   */
  private bindStockPageEvents(): void {
    if (!this.stockView || !this.modalService) return;

    // Eventos de la vista de stock
    this.stockView.bindAddProductEvent(() => this.handleAddProduct());
    this.stockView.bindEditEvent((productId) => this.handleEditProduct(productId));
    this.stockView.bindDeleteEvent((productId) => this.handleDeleteProduct(productId));

    // Eventos del modal
    document.addEventListener('addProduct', (event: any) => {
      this.processAddProduct(event.detail.productData);
    });

    document.addEventListener('editProduct', (event: any) => {
      this.processEditProduct(event.detail.productId, event.detail.productData);
    });

    logger.debug('Stock page events bound');
  }

  /**
   * Se suscribe a cambios en el store Redux
   */
  private subscribeToStoreChanges(): void {
    // Suscribirse a cambios en productos
    const unsubscribeProducts = subscribeToSelector(
      commonSelectors.getAllProducts,
      (products) => this.handleProductsChange(products)
    );

    // Suscribirse a cambios en el carrito (solo en página principal)
    if (this.isMainPage()) {
      const unsubscribeCart = subscribeToSelector(
        (state) => ({
          items: commonSelectors.getCartItems(state),
          total: commonSelectors.getCartTotal(state)
        }),
        (cart) => this.handleCartChange(cart.items, cart.total)
      );
      
      this.unsubscribeCallbacks.push(unsubscribeCart);
    }

    this.unsubscribeCallbacks.push(unsubscribeProducts);
  }

  /**
   * Maneja cambios en la lista de productos
   */
  private handleProductsChange(products: Product[]): void {
    if (this.productView) {
      this.productView.render(products);
    }
    
    if (this.stockView) {
      this.stockView.render(products);
    }
  }

  /**
   * Maneja cambios en el carrito
   */
  private handleCartChange(cartItems: any[], totalPrice: number): void {
    if (this.cartView) {
      this.cartView.render(cartItems, totalPrice);
    }
  }

  /**
   * Maneja la adición de productos al carrito
   */
  private async handleAddToCart(productId: number): Promise<void> {
    try {
      // Obtener el producto del store
      const product = selectFromStore(commonSelectors.getProductById(productId));
      
      if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
      }

      // Verificar si ya está en el carrito
      const isAlreadyInCart = selectFromStore(commonSelectors.isInCart(productId));
      
      if (isAlreadyInCart) {
        showNotification('El producto ya está en el carrito', 'warning');
        return;
      }

      // Añadir al carrito via Redux
      dispatchActions.addToCart(product);
      
      showNotification(`${product.nombre} añadido al carrito`, 'success');
      logger.info(`Product added to cart: ${product.nombre}`);
    } catch (error) {
      logger.error('Error adding to cart:', error);
      showNotification('Error al añadir al carrito', 'error');
    }
  }

  /**
   * Maneja la eliminación de productos del carrito
   */
  private handleRemoveFromCart(productId: number): void {
    try {
      const product = selectFromStore(commonSelectors.getProductById(productId));
      
      dispatchActions.removeFromCart(productId);
      
      const productName = product?.nombre || 'Producto';
      showNotification(`${productName} eliminado del carrito`, 'success');
      logger.info(`Product removed from cart: ${productName}`);
    } catch (error) {
      logger.error('Error removing from cart:', error);
      showNotification('Error al eliminar del carrito', 'error');
    }
  }

  /**
   * Maneja la adición de nuevos productos (página de stock)
   */
  private handleAddProduct(): void {
    if (!this.modalService) return;

    try {
      const products = selectFromStore(commonSelectors.getAllProducts);
      const newId = generateProductId(products);
      
      this.modalService.setProductId(newId);
      this.modalService.openAddModal();
    } catch (error) {
      logger.error('Error opening add product modal:', error);
      showNotification('Error al abrir el formulario', 'error');
    }
  }

  /**
   * Maneja la edición de productos (página de stock)
   */
  private handleEditProduct(productId: number): void {
    if (!this.modalService) return;

    try {
      const product = selectFromStore(commonSelectors.getProductById(productId));
      
      if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
      }
      
      this.modalService.openEditModal(product);
    } catch (error) {
      logger.error('Error opening edit modal:', error);
      showNotification('Error al abrir el formulario de edición', 'error');
    }
  }

  /**
   * Maneja la eliminación de productos (página de stock)
   */
  private handleDeleteProduct(productId: number): void {
    if (!this.modalService) return;

    try {
      const product = selectFromStore(commonSelectors.getProductById(productId));
      
      if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
      }
      
      this.modalService.openDeleteModal(product, () => {
        dispatchActions.deleteProduct(productId);
        showNotification(`${product.nombre} eliminado exitosamente`, 'success');
      });
    } catch (error) {
      logger.error('Error opening delete modal:', error);
      showNotification('Error al abrir la confirmación', 'error');
    }
  }

  /**
   * Procesa la adición de productos desde el modal
   */
  private async processAddProduct(productData: any): Promise<void> {
    try {
      const validation = validateProduct(productData);
      if (!validation.isValid) {
        showNotification(`Errores: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      await dispatchActions.addProduct(productData);
      
      showNotification(`${productData.nombre} añadido exitosamente`, 'success');
      
      // Resaltar producto si es posible
      if (this.stockView) {
        setTimeout(() => {
          this.stockView?.highlightProduct(productData.id);
        }, 100);
      }
    } catch (error) {
      logger.error('Error adding product:', error);
      showNotification('Error al añadir el producto', 'error');
    }
  }

  /**
   * Procesa la edición de productos desde el modal
   */
  private async processEditProduct(productId: number, productData: any): Promise<void> {
    try {
      const validation = validateProduct(productData);
      if (!validation.isValid) {
        showNotification(`Errores: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      const updatedProduct = { ...productData, id: productId };
      await dispatchActions.updateProduct(updatedProduct);
      
      showNotification(`${productData.nombre} actualizado exitosamente`, 'success');
      
      // Resaltar producto
      if (this.stockView) {
        setTimeout(() => {
          this.stockView?.highlightProduct(productId);
        }, 100);
      }
    } catch (error) {
      logger.error('Error updating product:', error);
      showNotification('Error al actualizar el producto', 'error');
    }
  }

  /**
   * Utilidades de detección de página
   */
  private isMainPage(): boolean {
    return document.getElementById('productList') !== null;
  }

  private isStockPage(): boolean {
    return document.getElementById('stockList') !== null;
  }

  /**
   * Método para debugging - muestra el estado actual del store
   */
  public logCurrentState(): void {
    const state = selectFromStore((state) => state);
    console.group('🔄 Redux State');
    console.log('Products:', state.products);
    console.log('Cart:', state.cart);
    console.groupEnd();
  }

  /**
   * Cleanup - desuscribirse de todos los listeners
   */
  public destroy(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
    logger.info('AppControllerRedux destroyed');
  }
}