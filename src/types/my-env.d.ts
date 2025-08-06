
/// <reference types="vite/client" />

// Declaraciones de tipos para el entorno
declare global {
  interface Window {
    // PWA related
    workbox?: any;
    __WB_MANIFEST?: any;
  }
}

// Declaraciones para módulos que podrían no tener tipos
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

export {};