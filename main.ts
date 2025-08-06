import { PWAService } from './src/services/PWAService';
import { AuthController } from './src/controllers/AuthController';
import { AuthView } from './src/views/AuthView';
import { ProductController } from './src/controllers/ProductController';
import { CartController } from './src/controllers/CartController';
import { StockController } from './src/controllers/StockController';
import { ProductView } from './src/views/ProductView';
import { CartView } from './src/views/CartView';
import { StockView } from './src/views/StockView';
import { ProductService } from './src/services/ProductService';
import { CartModel } from './src/models/CartModel';

class App {
  private pwaService: PWAService;
  private productController: ProductController;
  private cartController: CartController;
  private stockController: StockController;
  private productView: ProductView;
  private cartView: CartView;
  private stockView: StockView;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Inicializar PWA - CORREGIDO: sin llamar a init() porque es privado
      this.pwaService = new PWAService();
      
      // Inicializar autenticación antes que todo lo demás
      await AuthController.initializeAuth();
      
      // Inicializar vistas según la página actual
      this.initializeCurrentPage();
      
      // Configurar navegación auth-aware
      this.setupAuthAwareNavigation();
      
      console.log('Aplicación inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
    }
  }

  private initializeCurrentPage() {
    const currentPath = window.location.pathname;
    
    switch (true) {
      case currentPath === '/' || currentPath.includes('index.html'):
        this.initializeHomePage();
        break;
      case currentPath.includes('gestion-stock.html'):
        this.initializeStockPage();
        break;
      case currentPath.includes('login.html'):
        this.initializeLoginPage();
        break;
      default:
        console.log('Página no reconocida:', currentPath);
    }
  }

  private async initializeHomePage() {
    // Verificar si debe mostrar contenido protegido
    this.checkAuthAccess();
    
    // CORREGIDO: Crear servicios necesarios
    const productService = new ProductService();
    const cartModel = new CartModel();
    
    // CORREGIDO: Inicializar controladores con sus dependencias
    this.productController = new ProductController(productService);
    this.cartController = new CartController(cartModel, productService);
    
    // CORREGIDO: Inicializar vistas con sus contenedores específicos
    this.productView = new ProductView('productList');
    this.cartView = new CartView('cartList', 'totalPriceValue');
    
    // CORREGIDO: Conectar vistas con controladores
    this.productController.setView(this.productView);
    this.cartController.setView(this.cartView);
    
    // CORREGIDO: Inicializar controladores (método correcto)
    await this.productController.initialize();
    await this.cartController.initialize();
    
    // Actualizar navegación
    AuthView.initializeNavigation();
    
    console.log('Página de inicio inicializada');
  }

  private async initializeStockPage() {
    // Verificar autenticación requerida
    if (!AuthController.requireAuth()) {
      return; // Ya redirige automáticamente
    }
    
    // CORREGIDO: Crear servicio necesario
    const productService = new ProductService();
    
    // CORREGIDO: Inicializar controlador con sus dependencias
    this.stockController = new StockController(productService);
    
    // CORREGIDO: Inicializar vista con su contenedor específico
    this.stockView = new StockView('stockList');
    
    // CORREGIDO: Conectar vista con controlador
    this.stockController.setView(this.stockView);
    
    // CORREGIDO: Inicializar controlador (método correcto)
    await this.stockController.initialize();
    
    // Actualizar navegación
    AuthView.initializeNavigation();
    
    console.log('Página de gestión de stock inicializada');
  }

  private initializeLoginPage() {
    // La vista de login se encarga de su propia inicialización
    AuthView.initializeLoginPage();
    console.log('Página de login inicializada');
  }

  private setupAuthAwareNavigation() {
    // Escuchar cambios en el estado de autenticación
    let currentAuthState = AuthController.isAuthenticated();
    
    // Verificar cambios periódicamente (en caso de que la sesión expire)
    setInterval(() => {
      const newAuthState = AuthController.isAuthenticated();
      if (newAuthState !== currentAuthState) {
        currentAuthState = newAuthState;
        AuthView.updateNavigationButtons();
        
        // Si perdió la autenticación y está en página protegida
        if (!newAuthState && window.location.pathname.includes('gestion-stock.html')) {
          window.location.href = '/';
        }
      }
    }, 60000); // Verificar cada minuto

    // Extender sesión en actividad del usuario
    document.addEventListener('click', () => {
      AuthController.extendSession();
    });

    document.addEventListener('keydown', () => {
      AuthController.extendSession();
    });
  }

  private checkAuthAccess() {
    // En la página principal, simplemente actualizar la navegación
    // No redirigir, solo mostrar/ocultar botones apropiados
    const isAuthenticated = AuthController.isAuthenticated();
    console.log('Usuario autenticado:', isAuthenticated);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Manejar errores globales
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada sin manejar:', event.reason);
});