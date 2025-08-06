// Definir tipos para las variables de entorno de Vite
interface ImportMetaEnv {
  readonly VITE_USE_REDUX: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_PWA_NAME: string
  readonly VITE_PWA_SHORT_NAME: string
  readonly VITE_PWA_THEME_COLOR: string
  readonly VITE_DEV_SERVER_PORT: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_BASE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_SW_ENABLED: string
  readonly VITE_SW_CACHE_VERSION: string
  
  // Variables especiales de Vite
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot?: {
    accept: (cb?: () => void) => void
    accept: (deps: string[], cb?: (modules: any[]) => void) => void
    accept: (dep: string, cb?: (module: any) => void) => void
    dispose: (cb: () => void) => void
    invalidate: () => void
    decline: () => void
    on: (event: string, cb: (...args: any[]) => void) => void
  }
}

// Extensiones globales para debugging en desarrollo
declare global {
  interface Window {
    reduxStore?: any
    logReduxState?: () => void
    switchToRedux?: () => void
    switchToMVC?: () => void
    getCurrentMode?: () => string
    toggleMode?: () => void
  }
}