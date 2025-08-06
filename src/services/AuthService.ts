import { User, findUserByCredentials } from '../data/users';

export class AuthService {
  private static readonly STORAGE_KEY = 'nordora_user_session';
  private static readonly SESSION_EXPIRY_KEY = 'nordora_session_expiry';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  static async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simular delay de red para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Nombre de usuario y contraseña son requeridos' };
    }

    const user = findUserByCredentials(username, password);
    
    if (user) {
      this.saveUserSession(user);
      return { success: true, user };
    } else {
      return { success: false, error: 'Credenciales inválidas' };
    }
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }

  static getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.STORAGE_KEY);
      const expiryTime = localStorage.getItem(this.SESSION_EXPIRY_KEY);
      
      if (!userJson || !expiryTime) {
        return null;
      }

      // Verificar si la sesión ha expirado
      if (Date.now() > parseInt(expiryTime)) {
        this.logout(); // Limpiar sesión expirada
        return null;
      }

      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error al obtener usuario de localStorage:', error);
      this.logout(); // Limpiar datos corruptos
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private static saveUserSession(user: User): void {
    try {
      const expiryTime = Date.now() + this.SESSION_DURATION;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error('Error al guardar sesión en localStorage:', error);
    }
  }

  static extendSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.saveUserSession(user);
    }
  }
}