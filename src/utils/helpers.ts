// Funciones de ayuda que se pueden usar en toda la aplicación

import { Product } from '../types/index';

/**
 * Formatea un precio para mostrar
 * @param price - Precio numérico
 * @returns Precio formateado con símbolo de euro
 */
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)}€`;
};

/**
 * Genera un ID único para nuevos productos
 * @param existingProducts - Array de productos existentes
 * @returns Nuevo ID único
 */
export const generateProductId = (existingProducts: Product[]): number => {
  if (existingProducts.length === 0) return 1;
  
  const maxId = Math.max(...existingProducts.map(p => p.id));
  return maxId + 1;
};

/**
 * Valida si una URL de imagen es válida
 * @param imageUrl - URL o nombre de archivo de imagen
 * @returns true si es válida
 */
export const isValidImageUrl = (imageUrl: string): boolean => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerUrl = imageUrl.toLowerCase();
  return validExtensions.some(ext => lowerUrl.endsWith(ext));
};

/**
 * Construye la ruta completa de una imagen
 * @param imageName - Nombre del archivo de imagen
 * @returns Ruta completa a la imagen
 */
export const getImagePath = (imageName: string): string => {
  // Si ya es una URL completa, devolverla tal como está
  if (imageName.startsWith('http')) return imageName;
  
  // Si es solo el nombre del archivo, construir la ruta
  return `./assets/images/${imageName}`;
};

/**
 * Debounce function para limitar llamadas frecuentes
 * @param func - Función a ejecutar
 * @param wait - Tiempo de espera en milisegundos
 * @returns Función debounced
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Detecta si estamos en modo desarrollo
 */
const isDevelopment = (): boolean => {
  // Múltiples formas de detectar desarrollo
  try {
    // Método 1: Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
    }
    
    // Método 2: Node.js
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
    
    // Método 3: Detectar por hostname
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname === '0.0.0.0' ||
             hostname.includes('.local');
    }
    
    // Método 4: Fallback - detectar por console
    return typeof console !== 'undefined' && 
           typeof console.debug === 'function';
  } catch {
    return false;
  }
};

/**
 * Función para logging con niveles
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment()) {
      console.log(`🐛 [DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment()) {
      console.info(`ℹ️ [INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ [WARN] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  }
};

/**
 * Valida los datos de un producto
 * @param product - Datos del producto a validar
 * @returns Objeto con validación y errores
 */
export const validateProduct = (product: Partial<Product>) => {
  const errors: string[] = [];
  
  if (!product.nombre || product.nombre.trim().length === 0) {
    errors.push('El nombre es obligatorio');
  }
  
  if (!product.precio || product.precio <= 0) {
    errors.push('El precio debe ser mayor que 0');
  }
  
  if (!product.dimensiones || product.dimensiones.trim().length === 0) {
    errors.push('Las dimensiones son obligatorias');
  }
  
  if (!product.img || product.img.trim().length === 0) {
    errors.push('La imagen es obligatoria');
  } else if (!isValidImageUrl(product.img)) {
    errors.push('El formato de imagen no es válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Función para detectar si estamos offline
 * @returns true si estamos offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Función para mostrar notificaciones al usuario
 * @param message - Mensaje a mostrar
 * @param type - Tipo de notificación
 */
export const showNotification = (
  message: string, 
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  // Implementación básica - podrías usar una librería de notificaciones
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  // Colores según el tipo
  const colors = {
    success: '#008060',
    error: '#d82c0d',
    warning: '#ffc453',
    info: '#2c6ecb'
  };
  
  notification.style.backgroundColor = colors[type];
  
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

/**
 * Función para sanitizar entrada de usuario
 * @param input - Texto a sanitizar
 * @returns Texto sanitizado
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres HTML básicos
    .substring(0, 1000); // Limitar longitud
};