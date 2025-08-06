import { AuthController } from '../controllers/AuthController';

export class AuthView {
  
  static renderLoginButton(): string {
    return `
      <a href="/pages/login.html" class="btn-primary icon-txt-btn">
        <span class="material-symbols-outlined">login</span>
        Login
      </a>
    `;
  }

  static renderLogoutButton(): string {
    return `
      <button class="btn-logout icon-txt-btn" id="logout-btn">
        <span class="material-symbols-outlined">logout</span>
        Cerrar sesión
      </button>
    `;
  }

  static renderStockButton(): string {
    return `
      <a href="/pages/gestion-stock.html" class="btn-primary icon-txt-btn">
        <span class="material-symbols-outlined">settings</span>
        Gestionar stock
      </a>
    `;
  }

  static initializeNavigation(): void {
    this.updateNavigationButtons();
    this.setupLogoutHandler();
  }

  static updateNavigationButtons(): void {
    const navButtons = document.querySelector('#nav-auth-buttons');
    if (!navButtons) return;

    const isAuthenticated = AuthController.isAuthenticated();
    const currentUser = AuthController.getCurrentUser();
    const currentPath = window.location.pathname;
    
    // Limpiar botones existentes
    navButtons.innerHTML = '';

    if (isAuthenticated && currentUser) {
      // Usuario autenticado
      if (currentPath.includes('gestion-stock.html')) {
        // En página de stock: mostrar logout y volver a tienda
        navButtons.innerHTML = `
          ${this.renderUserWelcome()}
          ${this.renderLogoutButton()}
          <a href="/" class="btn-primary icon-txt-btn">
            <span class="material-symbols-outlined">storefront</span>
            Volver a la tienda
          </a>
        `;
      } else {
        // En página principal: mostrar logout y gestionar stock
        navButtons.innerHTML = `
          ${this.renderUserWelcome()}
          ${this.renderLogoutButton()}
          ${this.renderStockButton()}
        `;
      }
    } else {
      // Usuario no autenticado: mostrar solo login
      navButtons.innerHTML = `
        ${this.renderLoginButton()}
      `;
    }
  }

  static setupLogoutHandler(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'logout-btn') {
        e.preventDefault();
        this.handleLogout();
      }
    });
  }

  static handleLogout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      AuthController.logout();
      this.updateNavigationButtons();
      
      // Si estamos en la página de gestión de stock, redirigir al inicio
      if (window.location.pathname.includes('gestion-stock.html')) {
        window.location.href = '/';
      }
    }
  }

  static renderUserWelcome(): string {
    const user = AuthController.getCurrentUser();
    if (user) {
      return `
        <span class="user-welcome">Bienvenido, ${user.name}</span>
      `;
    }
    return '';
  }

  // Método para inicializar la vista de login
  static initializeLoginPage(): void {
    this.setupLoginForm();
    AuthController.redirectIfAuthenticated(); // Redirigir si ya está logueado
  }

  private static setupLoginForm(): void {
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin(loginForm);
    });
  }

  private static async handleLogin(form: HTMLFormElement): Promise<void> {
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const errorDiv = document.getElementById('login-error');
    
    // Mostrar loading
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';
    
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }

    try {
      const result = await AuthController.login(username, password);
      
      if (result.success) {
        // Redirigir al inicio
        window.location.href = '/';
      } else {
        // Mostrar error
        if (errorDiv) {
          errorDiv.textContent = result.error || 'Error al iniciar sesión';
          errorDiv.style.display = 'block';
        }
      }
    } catch (error) {
      if (errorDiv) {
        errorDiv.textContent = 'Error interno. Intenta de nuevo.';
        errorDiv.style.display = 'block';
      }
    } finally {
      // Restaurar botón
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  }
}