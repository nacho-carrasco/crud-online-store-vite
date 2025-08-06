import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Product } from '../types/index'
import { ProductService } from '../services/ProductService'

interface ProductState {
  items: Product[]
  loading: boolean
  error: string | null
}

const initialState: ProductState = {
  items: [],
  loading: false,
  error: null
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const productService = new ProductService()
    return await productService.getAllProducts()
  }
)

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (product: Omit<Product, 'id'>) => {
    const productService = new ProductService()
    const products = await productService.getAllProducts()
    const newId = Math.max(...products.map(p => p.id), 0) + 1
    const newProduct = { ...product, id: newId }
    const updatedProducts = [...products, newProduct]
    await productService.saveProducts(updatedProducts)
    return newProduct
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (product: Product) => {
    const productService = new ProductService()
    const products = await productService.getAllProducts()
    const updatedProducts = products.map(p => p.id === product.id ? product : p)
    await productService.saveProducts(updatedProducts)
    return product
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: number) => {
    const productService = new ProductService()
    const products = await productService.getAllProducts()
    const updatedProducts = products.filter(p => p.id !== productId)
    await productService.saveProducts(updatedProducts)
    return productId
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload)
      })
  }
})

export default productSlice.reducer