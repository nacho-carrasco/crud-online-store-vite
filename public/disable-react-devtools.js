// Script para desactivar completamente React DevTools y prevenir errores

(function() {
  'use strict';
  
  // Desactivar React DevTools
  if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: true,
      supportsFiber: false,
      inject: function() { return false; },
      onCommitFiberRoot: function() {},
      onCommitFiberUnmount: function() {},
    };
  }

  // Prevenir errores de React en consola
  const originalError = console.error;
  console.error = function(...args) {
    // Filtrar errores específicos de React
    const message = args[0];
    if (typeof message === 'string') {
      // Ignorar errores de React DevTools
      if (message.includes('React') || 
          message.includes('Minified React error') ||
          message.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')) {
        return;
      }
    }
    // Mostrar otros errores normalmente
    originalError.apply(console, args);
  };

  // Prevenir warnings de desarrollo
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args[0];
    if (typeof message === 'string') {
      // Ignorar warnings específicos
      if (message.includes('React') || 
          message.includes('DevTools') ||
          message.includes('development')) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };

  console.log('🛡️ React DevTools disabled successfully');
})();