// ============================================
// 2. MODELO DE PRODUCTO (src/models/ProductModel.ts)
// ============================================
// Un "modelo" es como una plantilla que define cómo debe comportarse un objeto.
// Es la "M" de MVC (Model-View-Controller)

import { Product } from '../types/index';

export class ProductModel {
  // El "constructor" es lo que se ejecuta cuando creamos un nuevo producto
  // Es como decir: "para crear un producto necesito estos 5 datos"
  constructor(
    public id: number,
    public img: string,
    public nombre: string,
    public dimensiones: string,
    public precio: number
  ) {
    // Al poner "public" antes de cada parámetro, TypeScript automáticamente
    // crea propiedades en la clase. Es como escribir:
    // this.id = id;
    // this.img = img;
    // etc.
  }

  // Método estático: se puede llamar sin crear un objeto primero
  // Es útil para convertir datos "planos" en objetos ProductModel
  static fromJSON(data: any): ProductModel {
    // Toma un objeto normal (como los que vienen del localStorage)
    // y crea un ProductModel completo con todos sus métodos
    return new ProductModel(
      data.id,
      data.img,
      data.nombre,
      data.dimensiones,
      data.precio
    );
  }

  // Convierte el ProductModel de vuelta a un objeto "plano"
  // Útil para guardar en localStorage o enviar por internet
  toJSON(): Product {
    return {
      id: this.id,
      img: this.img,
      nombre: this.nombre,
      dimensiones: this.dimensiones,
      precio: this.precio
    };
  }

  // Método para verificar si los datos del producto son válidos
  isValid(): boolean {
    // Devuelve true solo si:
    // - El ID es mayor que 0 (positivo)
    // - El nombre no está vacío (después de quitar espacios)
    // - El precio es mayor que 0
    return this.id > 0 && 
           this.nombre.trim().length > 0 && 
           this.precio > 0;
  }
}