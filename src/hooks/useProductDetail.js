import { useProducts } from '../context/ProductsContext.jsx'

/**
 * Custom hook to retrieve a product's details from memory (via ProductsContext).
 * Avoids direct API calls and cascades by using pre-fetched and pre-normalized data.
 * Ready to be easily migrated to Redux in the future.
 * 
 * @param {string|number} id - Product ID
 */
export function useProductDetail(id) {
  const { byId, loading, error } = useProducts()
  
  const product = id ? (byId[id] ?? null) : null
  const notFound = !loading && !product

  return {
    producto: product,
    loading,
    error,
    notFound,
  }
}
