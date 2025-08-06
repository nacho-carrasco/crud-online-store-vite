import { ProductService } from '../services/ProductService';
import { StockView } from '../views/StockView';
import { ModalService } from '../services/ModalService';
import { Product } from '../types/index';

export class StockController {
  private productService: ProductService;
  private stockView: StockView | null = null;
  private modalService: ModalService;

  constructor(productService: ProductService) {
    this.productService = productService;
    this.modalService = new ModalService();
    
    // Bind event listeners for modal events
    this.bindModalEvents();
  }

  setView(view: StockView): void {
    this.stockView = view;
    
    // Bind view events
    this.stockView.bindEditEvent(this.handleEditProduct.bind(this));
    this.stockView.bindDeleteEvent(this.handleDeleteProduct.bind(this));
    this.stockView.bindAddProductEvent(this.handleAddProduct.bind(this));
  }

  async initialize(): Promise<void> {
    if (!this.stockView) {
      console.log('StockView not initialized, skipping stock loading');
      return;
    }

    try {
      // Show loading state
      this.stockView.showLoading();
      
      // Load products
      const products = await this.productService.getAllProducts();
      
      // Render products
      this.stockView.render(products);
      
      console.log(`Stock initialized with ${products.length} products`);
    } catch (error) {
      console.error('Error initializing stock:', error);
    }
  }

  private bindModalEvents(): void {
    // Listen for modal events
    document.addEventListener('addProduct', this.handleAddProductSubmit.bind(this));
    document.addEventListener('editProduct', this.handleEditProductSubmit.bind(this));
  }

  private handleAddProduct(): void {
    console.log('Add product button clicked');
    
    // Get next available ID
    this.getNextAvailableId().then(nextId => {
      this.modalService.setProductId(nextId);
      this.modalService.openAddModal();
    });
  }

  private handleEditProduct(productId: number): void {
    console.log(`Edit product ${productId}`);
    
    this.productService.getProductById(productId).then(product => {
      if (product) {
        this.modalService.openEditModal(product);
      } else {
        alert('Producto no encontrado');
      }
    });
  }

  private handleDeleteProduct(productId: number): void {
    console.log(`Delete product ${productId}`);
    
    this.productService.getProductById(productId).then(product => {
      if (product) {
        this.modalService.openDeleteModal(product, () => {
          this.deleteProduct(productId);
        });
      } else {
        alert('Producto no encontrado');
      }
    });
  }

  private async handleAddProductSubmit(event: Event): Promise<void> {
    const customEvent = event as CustomEvent;
    const { productData } = customEvent.detail;
    
    try {
      // Get current products and add new one
      const products = await this.productService.getAllProducts();
      const newProduct: Product = {
        id: productData.id || await this.getNextAvailableId(),
        img: productData.img,
        nombre: productData.nombre,
        dimensiones: productData.dimensiones,
        precio: productData.precio
      };
      
      products.push(newProduct);
      await this.productService.saveProducts(products);
      
      // Refresh view
      await this.initialize();
      
      // Highlight new product
      if (this.stockView) {
        this.stockView.highlightProduct(newProduct.id);
      }
      
      console.log('Product added successfully:', newProduct);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error al añadir el producto');
    }
  }

  private async handleEditProductSubmit(event: Event): Promise<void> {
    const customEvent = event as CustomEvent;
    const { productData } = customEvent.detail;
    
    try {
      // Get current products and update the specific one
      const products = await this.productService.getAllProducts();
      const productIndex = products.findIndex(p => p.id === productData.id);
      
      if (productIndex !== -1) {
        products[productIndex] = {
          id: productData.id,
          img: productData.img,
          nombre: productData.nombre,
          dimensiones: productData.dimensiones,
          precio: productData.precio
        };
        
        await this.productService.saveProducts(products);
        
        // Refresh view
        await this.initialize();
        
        // Highlight updated product
        if (this.stockView) {
          this.stockView.highlightProduct(productData.id);
        }
        
        console.log('Product updated successfully:', productData);
      } else {
        throw new Error('Product not found for update');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto');
    }
  }

  private async deleteProduct(productId: number): Promise<void> {
    try {
      // Get current products and remove the specific one
      const products = await this.productService.getAllProducts();
      const filteredProducts = products.filter(p => p.id !== productId);
      
      await this.productService.saveProducts(filteredProducts);
      
      // Refresh view
      await this.initialize();
      
      console.log(`Product ${productId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  }

  private async getNextAvailableId(): Promise<number> {
    try {
      const products = await this.productService.getAllProducts();
      if (products.length === 0) {
        return 1;
      }
      
      const maxId = Math.max(...products.map(p => p.id));
      return maxId + 1;
    } catch (error) {
      console.error('Error getting next ID:', error);
      return 1;
    }
  }
}