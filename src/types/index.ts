// ============================================
// 1. TIPOS E INTERFACES (src/types/index.ts)
// ============================================
// Los "tipos" e "interfaces" son como "moldes" que definen qué propiedades 
// debe tener un objeto. Es como decir "todos los productos DEBEN tener estas características"

export interface Product {
  id: number;        // Número único que identifica cada producto (1, 2, 3...)
  img: string;       // Nombre del archivo de imagen ("sofa.jpg")
  nombre: string;    // Nombre del producto ("Sofá moderno")
  dimensiones: string; // Medidas del producto ("220 x 90 x 85 cm")
  precio: number;    // Precio en euros (399.99)
}

// CartItem es como Product, pero con una propiedad extra: cantidad
export interface CartItem extends Product {
  cantidad: number;  // Cuántas unidades de este producto hay en el carrito
}

// AppState define el "estado" completo de nuestra aplicación
export interface AppState {
  products: Product[];  // Lista de todos los productos
  cart: CartItem[];     // Lista de productos en el carrito
  isLoading: boolean;   // Si estamos cargando datos o no
}