import { ProductService } from '../services/ProductService';
import { CartModel } from '../models/CartModel';
import { ProductController } from './ProductController';
import { CartController } from './CartController';
import { StockController } from './StockController';
import { ProductView } from '../views/ProductView';
import { CartView } from '../views/CartView';
import { StockView } from '../views/StockView';
import { PWAService } from '../services/PWAService';

export class AppController {
  private productController: ProductController;
  private cartController: CartController;
  private stockController: StockController;
  private pwaService: PWAService;

  constructor() {
    // Initialize services
    const productService = new ProductService();
    const cartModel = new CartModel();

    // Initialize controllers
    this.productController = new ProductController(productService);
    this.cartController = new CartController(cartModel, productService);
    this.stockController = new StockController(productService);
    
    // Initialize PWA service
    this.pwaService = new PWAService();
  }

  async initialize(): Promise<void> {
    try {
      // Check what elements exist on current page
      const hasProductList = document.getElementById('productList') !== null;
      const hasCartList = document.getElementById('cartList') !== null;
      const hasStockList = document.getElementById('stockList') !== null;

      console.log('Elementos detectados:', {
        productList: hasProductList,
        cartList: hasCartList,
        stockList: hasStockList
      });

      // Initialize views and controllers based on available elements
      if (hasProductList) {
        const productView = new ProductView('productList');
        this.productController.setView(productView);
        await this.productController.initialize();
        console.log('Product controller initialized successfully');
      }

      if (hasCartList) {
        const cartView = new CartView('cartList', 'totalPriceValue');
        this.cartController.setView(cartView);
        await this.cartController.initialize();
        console.log('Cart controller initialized successfully');
      }

      if (hasStockList) {
        const stockView = new StockView('stockList');
        this.stockController.setView(stockView);
        await this.stockController.initialize();
        console.log('Stock controller initialized successfully');
      }

      console.log('App initialization completed successfully');
    } catch (error) {
      console.error('Error during app initialization:', error);
      // Mostrar error al usuario de forma amigable
      this.showErrorMessage('Error al inicializar la aplicación. Por favor, recarga la página.');
    }
  }

  private showErrorMessage(message: string): void {
    // Crear notificación de error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d82c0d;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}