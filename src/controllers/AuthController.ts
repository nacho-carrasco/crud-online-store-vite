import { store } from '../store/store';
import { loginStart, loginSuccess, loginFailure, logout, initializeAuth } from '../slices/authSlice';
import { AuthService } from '../services/AuthService';

export class AuthController {
  
  static async initializeAuth(): Promise<void> {
    const user = AuthService.getCurrentUser();
    store.dispatch(initializeAuth(user));
  }

  static async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    store.dispatch(loginStart());
    
    try {
      const result = await AuthService.login(username, password);
      
      if (result.success && result.user) {
        store.dispatch(loginSuccess(result.user));
        return { success: true };
      } else {
        store.dispatch(loginFailure());
        return { success: false, error: result.error };
      }
    } catch (error) {
      store.dispatch(loginFailure());
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  static logout(): void {
    AuthService.logout();
    store.dispatch(logout());
  }

  static isAuthenticated(): boolean {
    const state = store.getState();
    return state.auth.isAuthenticated;
  }

  static getCurrentUser() {
    const state = store.getState();
    return state.auth.user;
  }

  static requireAuth(): boolean {
    if (!this.isAuthenticated()) {
      // Redirigir a login si no está autenticado
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  }

  static redirectIfAuthenticated(): void {
    if (this.isAuthenticated()) {
      window.location.href = '/';
    }
  }

  static extendSession(): void {
    if (this.isAuthenticated()) {
      AuthService.extendSession();
    }
  }
}