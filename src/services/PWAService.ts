export class PWAService {
  private deferredPrompt: any = null;
  private showInstallButton: boolean = false; // ← Control para mostrar/ocultar botón

  constructor(options: { showInstallButton?: boolean } = {}) {
    this.showInstallButton = options.showInstallButton || false;
    this.init();
  }

  private init(): void {
    // Detecta si la PWA puede ser instalada
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      if (this.showInstallButton) {
        this.createInstallButton();
      } else {
        console.log('📱 PWA can be installed (install button disabled)');
      }
    });

    // Detecta cuando la PWA es instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
    });

    // Registra el service worker
    this.registerServiceWorker();
    
    // Maneja el estado de conexión
    this.handleConnectionChange();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Solo registrar en producción o si se solicita explícitamente
        const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        
        if (isDev) {
          console.log('[PWA] Development mode - Service Worker registration limited');
        }
        
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered successfully');
        
        // Actualización del service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.log('ServiceWorker registration failed:', error);
        // En desarrollo, esto es normal y no es un error crítico
      }
    }
  }

  /**
   * Crea el botón de instalación (solo si está habilitado)
   */
  private createInstallButton(): void {
    // Evita mostrar múltiples botones
    if (document.querySelector('.install-button')) {
      return;
    }

    const installButton = document.createElement('button');
    installButton.textContent = 'Instalar App';
    installButton.className = 'btn-primary install-button';
    installButton.style.cssText = `
      margin-left: 10px;
      font-size: 14px;
      padding: 6px 12px;
    `;
    installButton.addEventListener('click', () => this.installPWA());
    
    // Añadir botón a la interfaz
    const header = document.querySelector('.top-menu--container');
    if (header) {
      header.appendChild(installButton);
    }
  }

  /**
   * Oculta el botón de instalación
   */
  private hideInstallButton(): void {
    const installButton = document.querySelector('.install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  /**
   * Instala la PWA cuando se hace clic en el botón
   */
  private async installPWA(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  /**
   * Muestra notificación de actualización disponible
   */
  private showUpdateAvailable(): void {
    // Evita mostrar múltiples banners
    if (document.querySelector('.update-banner')) {
      return;
    }

    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div style="background: #2c6ecb; color: white; padding: 10px; text-align: center; position: fixed; top: 0; left: 0; right: 0; z-index: 10000;">
        Nueva versión disponible 
        <button onclick="this.parentElement.parentElement.remove(); location.reload();" 
                style="margin-left: 10px; padding: 5px 10px; background: white; color: #2c6ecb; border: none; border-radius: 4px; cursor: pointer;">
          Actualizar
        </button>
        <button onclick="this.parentElement.parentElement.remove();" 
                style="margin-left: 5px; padding: 5px 10px; background: transparent; color: white; border: 1px solid white; border-radius: 4px; cursor: pointer;">
          Después
        </button>
      </div>
    `;
    document.body.insertBefore(updateBanner, document.body.firstChild);
  }

  // Detecta si está offline
  static isOnline(): boolean {
    return navigator.onLine;
  }

  // Maneja el estado offline/online
  private handleConnectionChange(): void {
    window.addEventListener('online', () => {
      console.log('Back online');
      document.body.classList.remove('offline');
      this.showConnectionStatus('Conexión restaurada', 'success');
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      document.body.classList.add('offline');
      this.showConnectionStatus('Sin conexión - Modo offline', 'warning');
    });
  }

  private showConnectionStatus(message: string, type: 'success' | 'warning'): void {
    // Evita mostrar múltiples notificaciones
    const existingNotification = document.querySelector('.connection-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'connection-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? '#008060' : '#d82c0d'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Añadir animación CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Habilita el botón de instalación manualmente
   */
  public enableInstallButton(): void {
    this.showInstallButton = true;
    if (this.deferredPrompt) {
      this.createInstallButton();
    }
  }

  /**
   * Deshabilita el botón de instalación manualmente
   */
  public disableInstallButton(): void {
    this.showInstallButton = false;
    this.hideInstallButton();
  }

  // Método para enviar notificaciones push (opcional)
  static async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  static showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        ...options
      });
    }
  }

  // Método para verificar si la app está instalada
  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Método para obtener información de la red
  static getNetworkInfo(): any {
    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  }
}