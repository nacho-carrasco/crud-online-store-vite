
// Archivo BBDD.js - Contiene los datos iniciales
export const mueblesCargaManual = [
    {
        id: 1,
        img: "divan-nordico.jpg",
        nombre: "Diván nórdico",
        dimensiones: "100 x 50 x 45 cm",
        precio: 79.99
    },
    {
        id: 2,
        img: "estanteria-flotante.jpg",
        nombre: "Estantería flotante",
        dimensiones: "80 x 30 x 180 cm",
        precio: 149.99
    },
    {
        id: 3,
        img: "mesa-centro.jpg",
        nombre: "Mesa de centro",
        dimensiones: "160 x 90 x 75 cm",
        precio: 249.99
    },
    {
        id: 4,
        img: "silla-exterior.jpg",
        nombre: "Silla de exterior",
        dimensiones: "45 x 50 x 90 cm",
        precio: 49.99
    },
    {
        id: 5,
        img: "sofa-moderno.jpg",
        nombre: "Sofá moderno",
        dimensiones: "220 x 90 x 85 cm",
        precio: 399.99
    },
    {
        id: 6,
        img: "lampara-pie.jpg",
        nombre: "Lámpara de pie",
        dimensiones: "150 x 200 x 40 cm",
        precio: 299.99
    }
];

export const carritoCompraManual = [];

// Exportamos también las keys para asegurar que sean consistentes en la aplicación
export const MUEBLES_KEY = 'muebles_key';
export const CARRITO_KEY = 'carrito_key';