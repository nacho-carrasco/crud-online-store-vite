import { Product } from '../types/index';

export class ModalService {
  // Referencias a los elementos del DOM de los modales
  private maskOverlay: HTMLElement | null = null;
  private modalTitle: HTMLElement | null = null;
  private productForm: HTMLFormElement | null = null;
  private previewImg: HTMLImageElement | null = null;
  
  // Referencias al modal de eliminación
  private maskOverlayDelete: HTMLElement | null = null;
  private modalMessage: HTMLElement | null = null;
  
  // Variables para el estado del modal
  private currentProductId: number | null = null;
  private isEditMode: boolean = false;

  constructor() {
    // Solo inicializar si estamos en la página de gestión de stock
    if (this.isStockPage()) {
      try {
        // Inicializa todas las referencias del DOM
        this.initializeElements();
        // Configura todos los event listeners
        this.bindEvents();
        console.log('ModalService initialized successfully');
      } catch (error) {
        console.warn('ModalService initialization failed:', error);
        console.warn('Modal functionality will not be available');
      }
    } else {
      console.log('ModalService skipped - not on stock management page');
    }
  }

  /**
   * Verifica si estamos en la página de gestión de stock
   */
  private isStockPage(): boolean {
    return document.getElementById('maskOverlay') !== null;
  }

  /**
   * Inicializa las referencias a los elementos del DOM
   * Lanza error si algún elemento requerido no existe
   */
  private initializeElements(): void {
    // Modal principal (añadir/editar)
    this.maskOverlay = this.getElementById('maskOverlay');
    this.modalTitle = this.getElementById('modalTitle');
    this.productForm = this.getElementById('productoForm') as HTMLFormElement;
    this.previewImg = this.getElementById('previewImg') as HTMLImageElement;
    
    // Modal de eliminación
    this.maskOverlayDelete = this.getElementById('maskOverlayDelete');
    this.modalMessage = this.querySelector('.modal-message');

    // Verificar que todos los elementos críticos existan
    if (!this.maskOverlay || !this.modalTitle || !this.productForm || 
        !this.maskOverlayDelete || !this.modalMessage || !this.previewImg) {
      throw new Error('Required modal elements not found in DOM');
    }
  }

  /**
   * Método auxiliar para obtener elementos por ID con validación
   */
  private getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  /**
   * Método auxiliar para obtener elementos por selector con validación
   */
  private querySelector(selector: string): HTMLElement | null {
    return document.querySelector(selector) as HTMLElement;
  }

  /**
   * Configura todos los event listeners de los modales
   */
  private bindEvents(): void {
    if (!this.maskOverlay || !this.maskOverlayDelete) return;

    // Eventos del modal principal
    const closeModal = this.getElementById('closeModal');
    const cancelModal = this.getElementById('cancelModal');
    const submitButton = this.getElementById('formNuevoProductoSubmit');
    
    if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
    if (cancelModal) cancelModal.addEventListener('click', () => this.closeModal());
    if (submitButton) submitButton.addEventListener('click', (e) => this.handleSubmit(e));
    
    // Eventos del modal de eliminación
    const closeModalDelete = this.getElementById('closeModalDelete');
    const cancelModalDelete = this.getElementById('cancelModalDelete');
    
    if (closeModalDelete) closeModalDelete.addEventListener('click', () => this.closeDeleteModal());
    if (cancelModalDelete) cancelModalDelete.addEventListener('click', () => this.closeDeleteModal());
    
    // Cerrar modal haciendo click fuera de él
    this.maskOverlay.addEventListener('click', (e) => {
      if (e.target === this.maskOverlay) this.closeModal();
    });
    
    this.maskOverlayDelete.addEventListener('click', (e) => {
      if (e.target === this.maskOverlayDelete) this.closeDeleteModal();
    });

    // Preview de imagen cuando cambia el nombre del archivo
    const imagenInput = this.getElementById('imagen');
    if (imagenInput) {
      imagenInput.addEventListener('input', (e) => this.updateImagePreview(e));
    }
  }

  /**
   * Abre el modal para añadir un nuevo producto
   */
  openAddModal(): void {
    if (!this.modalTitle || !this.maskOverlay) {
      console.error('Modal elements not available');
      return;
    }

    this.isEditMode = false;
    this.currentProductId = null;
    
    // Cambia el título del modal
    this.modalTitle.textContent = 'Añadir producto al stock';
    
    // Limpia el formulario
    this.clearForm();
    
    // Muestra el modal
    this.showModal();
  }

  /**
   * Abre el modal para editar un producto existente
   */
  openEditModal(product: Product): void {
    if (!this.modalTitle || !this.maskOverlay) {
      console.error('Modal elements not available');
      return;
    }

    this.isEditMode = true;
    this.currentProductId = product.id;
    
    // Cambia el título del modal
    this.modalTitle.textContent = 'Editar producto';
    
    // Rellena el formulario con los datos del producto
    this.populateForm(product);
    
    // Muestra el modal
    this.showModal();
  }

  /**
   * Abre el modal de confirmación para eliminar un producto
   */
  openDeleteModal(product: Product, onConfirm: () => void): void {
    if (!this.modalMessage || !this.maskOverlayDelete) {
      console.error('Delete modal elements not available');
      return;
    }

    // Configura el mensaje de confirmación
    this.modalMessage.innerHTML = `
      <strong>¿Estás seguro de que quieres eliminar este producto?</strong><br><br>
      <strong>Nombre:</strong> ${product.nombre}<br>
      <strong>Precio:</strong> ${product.precio.toFixed(2)}€<br><br>
      <em>Esta acción no se puede deshacer.</em>
    `;
    
    // Configura el botón de confirmación
    const confirmBtn = this.getElementById('btnDeleteConfirm');
    if (confirmBtn) {
      // Remueve listeners anteriores y añade el nuevo
      const newConfirmBtn = confirmBtn.cloneNode(true) as HTMLElement;
      confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);
      
      newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        this.closeDeleteModal();
      });
    }
    
    // Muestra el modal de eliminación
    this.showDeleteModal();
  }

  /**
   * Rellena el formulario con los datos de un producto
   */
  private populateForm(product: Product): void {
    const idField = this.getElementById('id-field') as HTMLInputElement;
    const imagenField = this.getElementById('imagen') as HTMLInputElement;
    const nombreField = this.getElementById('nombre') as HTMLInputElement;
    const dimensionesField = this.getElementById('dimensiones') as HTMLInputElement;
    const precioField = this.getElementById('precio') as HTMLInputElement;

    if (idField) idField.value = product.id.toString();
    if (imagenField) imagenField.value = product.img;
    if (nombreField) nombreField.value = product.nombre;
    if (dimensionesField) dimensionesField.value = product.dimensiones;
    if (precioField) precioField.value = product.precio.toString();
    
    // Actualiza la preview de la imagen
    this.updateImagePreview();
  }

  /**
   * Limpia todos los campos del formulario
   */
  private clearForm(): void {
    if (!this.productForm) return;

    this.productForm.reset();
    const imagenField = this.getElementById('imagen') as HTMLInputElement;
    if (imagenField) imagenField.value = 'default-img.jpg';
    this.hideImagePreview();
  }

  /**
   * Establece manualmente el ID (usado por el controller)
   */
  setProductId(id: number): void {
    const idField = this.getElementById('id-field') as HTMLInputElement;
    if (idField) idField.value = id.toString();
  }

  /**
   * Actualiza la preview de la imagen basada en el nombre del archivo
   */
  private updateImagePreview(event?: Event): void {
    const imgInput = this.getElementById('imagen') as HTMLInputElement;
    if (!imgInput || !this.previewImg) return;

    const imgName = imgInput.value.trim();
    
    if (imgName && imgName !== 'default-img.jpg') {
      this.previewImg.src = `../assets/images/${imgName}`;
      this.previewImg.style.display = 'block';
      
      // Maneja errores de carga de imagen
      this.previewImg.onerror = () => {
        if (this.previewImg) {
          this.previewImg.src = '../assets/images/default-img.jpg';
        }
      };
    } else {
      this.hideImagePreview();
    }
  }

  /**
   * Oculta la preview de la imagen
   */
  private hideImagePreview(): void {
    if (this.previewImg) {
      this.previewImg.style.display = 'none';
    }
  }

  /**
   * Maneja el envío del formulario
   */
  private handleSubmit(event: Event): void {
    event.preventDefault();
    
    // Valida el formulario
    if (!this.validateForm()) {
      return;
    }
    
    // Obtiene los datos del formulario
    const formData = this.getFormData();
    
    // Emite un evento personalizado con los datos
    const eventName = this.isEditMode ? 'editProduct' : 'addProduct';
    const customEvent = new CustomEvent(eventName, { 
      detail: { 
        productData: formData,
        productId: this.currentProductId 
      } 
    });
    
    document.dispatchEvent(customEvent);
    
    // Cierra el modal
    this.closeModal();
  }

  /**
   * Valida que todos los campos requeridos estén llenos
   */
  private validateForm(): boolean {
    const imagenField = this.getElementById('imagen') as HTMLInputElement;
    const nombreField = this.getElementById('nombre') as HTMLInputElement;
    const dimensionesField = this.getElementById('dimensiones') as HTMLInputElement;
    const precioField = this.getElementById('precio') as HTMLInputElement;

    if (!imagenField || !nombreField || !dimensionesField || !precioField) {
      alert('Error: No se pueden acceder a los campos del formulario');
      return false;
    }

    const imagen = imagenField.value.trim();
    const nombre = nombreField.value.trim();
    const dimensiones = dimensionesField.value.trim();
    const precio = parseFloat(precioField.value);
    
    if (!imagen) {
      alert('Por favor, ingresa el nombre del archivo de imagen');
      return false;
    }
    
    if (!nombre) {
      alert('Por favor, ingresa el nombre del producto');
      return false;
    }
    
    if (!dimensiones) {
      alert('Por favor, ingresa las dimensiones del producto');
      return false;
    }
    
    if (isNaN(precio) || precio <= 0) {
      alert('Por favor, ingresa un precio válido mayor que 0');
      return false;
    }
    
    return true;
  }

  /**
   * Obtiene los datos del formulario como objeto
   */
  private getFormData(): Omit<Product, 'id'> & { id?: number } {
    const idField = this.getElementById('id-field') as HTMLInputElement;
    const imagenField = this.getElementById('imagen') as HTMLInputElement;
    const nombreField = this.getElementById('nombre') as HTMLInputElement;
    const dimensionesField = this.getElementById('dimensiones') as HTMLInputElement;
    const precioField = this.getElementById('precio') as HTMLInputElement;

    return {
      id: idField ? parseInt(idField.value) || undefined : undefined,
      img: imagenField ? imagenField.value.trim() : '',
      nombre: nombreField ? nombreField.value.trim() : '',
      dimensiones: dimensionesField ? dimensionesField.value.trim() : '',
      precio: precioField ? parseFloat(precioField.value) : 0
    };
  }

  /**
   * Muestra el modal principal
   */
  private showModal(): void {
    if (this.maskOverlay) {
      this.maskOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Previene scroll del fondo
    }
  }

  /**
   * Oculta el modal principal
   */
  private closeModal(): void {
    if (this.maskOverlay) {
      this.maskOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Restaura scroll
      this.clearForm();
    }
  }

  /**
   * Muestra el modal de eliminación
   */
  private showDeleteModal(): void {
    if (this.maskOverlayDelete) {
      this.maskOverlayDelete.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Oculta el modal de eliminación
   */
  private closeDeleteModal(): void {
    if (this.maskOverlayDelete) {
      this.maskOverlayDelete.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}