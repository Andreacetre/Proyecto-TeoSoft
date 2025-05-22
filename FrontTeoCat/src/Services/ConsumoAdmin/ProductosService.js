import axiosInstance from "../ConsumoAdmin/axios.js"

/**
 * Servicio para consumir la API de productos y sus variantes
 */
const ProductosService = {
  // PRODUCTOS

  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  getAll: async () => {
    try {
      console.log("Obteniendo todos los productos")
      const response = await axiosInstance.get("/products/productos")
      console.log("Productos obtenidos:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al obtener productos:", error)
      throw error
    }
  },

  /**
   * Obtiene un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getById: async (id) => {
    try {
      console.log(`Obteniendo producto con ID ${id}`)
      const response = await axiosInstance.get(`/products/productos/${id}`)
      console.log(`Producto ${id} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Obtiene un producto por su código de barras
   * @param {string} codigo - Código de barras del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getByBarcode: async (codigo) => {
    try {
      console.log(`Obteniendo producto con código de barras ${codigo}`)
      const response = await axiosInstance.get(`/products/productos/codigo/${codigo}`)
      console.log(`Producto con código ${codigo} obtenido:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener producto con código ${codigo}:`, error)
      throw error
    }
  },

  /**
   * Obtiene productos por categoría
   * @param {number} idCategoria - ID de la categoría
   * @returns {Promise<Array>} Lista de productos de la categoría
   */
  getByCategoria: async (idCategoria) => {
    try {
      console.log(`Obteniendo productos de la categoría ${idCategoria}`)
      const response = await axiosInstance.get(`/products/productos/categoria/${idCategoria}`)
      console.log(`Productos de la categoría ${idCategoria} obtenidos:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${idCategoria}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo producto
   * @param {Object} productoData - Datos del producto a crear
   * @returns {Promise<Object>} Producto creado
   */
  create: async (productoData) => {
    try {
      console.log("Creando nuevo producto:", productoData)
      const response = await axiosInstance.post("/products/productos", productoData)
      console.log("Producto creado exitosamente:", response.data)
      return response.data
    } catch (error) {
      console.error("Error al crear producto:", error)
      throw error
    }
  },

  /**
   * Actualiza un producto existente
   * @param {number} id - ID del producto a actualizar
   * @param {Object} productoData - Datos actualizados del producto
   * @returns {Promise<Object>} Producto actualizado
   */
  update: async (id, productoData) => {
    try {
      console.log(`Actualizando producto con ID ${id}:`, productoData)
      const response = await axiosInstance.put(`/products/productos/${id}`, productoData)
      console.log(`Producto ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error)
      throw error
    }
  },

  /**
   * Cambia el estado de un producto (activo/inactivo)
   * @param {number} id - ID del producto
   * @param {boolean} estado - Nuevo estado del producto
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  changeStatus: async (id, estado) => {
    try {
      console.log(`Cambiando estado del producto ${id} a: ${estado}`)
      const response = await axiosInstance.patch(`/products/productos/${id}/status`, {
        Estado: estado,
      })
      console.log(`Estado del producto ${id} cambiado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al cambiar estado del producto ${id}:`, error)
      throw error
    }
  },

  /**
   * Actualiza el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} cantidad - Cantidad a agregar (positivo) o restar (negativo)
   * @returns {Promise<Object>} Respuesta de la actualización
   */
  updateStock: async (id, cantidad) => {
    try {
      console.log(`Actualizando stock del producto ${id} en ${cantidad} unidades`)
      const response = await axiosInstance.patch(`/products/productos/${id}/stock`, {
        cantidad: cantidad,
      })
      console.log(`Stock del producto ${id} actualizado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar stock del producto ${id}:`, error)
      throw error
    }
  },

  /**
   * Elimina un producto
   * @param {number} id - ID del producto a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  delete: async (id) => {
    try {
      console.log(`Eliminando producto con ID ${id}`)
      const response = await axiosInstance.delete(`/products/productos/${id}`)
      console.log(`Producto ${id} eliminado exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error)
      throw error
    }
  },

  // VARIANTES DE PRODUCTOS

  /**
   * Obtiene las variantes de un producto
   * @param {number} idProducto - ID del producto base
   * @returns {Promise<Array>} Lista de variantes
   */
  getVariantes: async (idProducto) => {
    try {
      console.log(`Obteniendo variantes del producto ${idProducto}`)
      const response = await axiosInstance.get(`/products/productos/${idProducto}/variantes`)
      console.log(`Variantes del producto ${idProducto} obtenidas:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al obtener variantes del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Crea una nueva variante para un producto
   * @param {number} idProducto - ID del producto base
   * @param {Object} varianteData - Datos de la variante a crear
   * @returns {Promise<Object>} Variante creada
   */
  createVariante: async (idProducto, varianteData) => {
    try {
      console.log(`Creando variante para el producto ${idProducto}:`, varianteData)
      const response = await axiosInstance.post(`/products/productos/${idProducto}/variantes`, varianteData)
      console.log(`Variante creada exitosamente para el producto ${idProducto}:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al crear variante para el producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Actualiza una variante existente
   * @param {number} idProducto - ID del producto base
   * @param {number} idVariante - ID de la variante a actualizar
   * @param {Object} varianteData - Datos actualizados de la variante
   * @returns {Promise<Object>} Variante actualizada
   */
  updateVariante: async (idProducto, idVariante, varianteData) => {
    try {
      console.log(`Actualizando variante ${idVariante} del producto ${idProducto}:`, varianteData)
      const response = await axiosInstance.put(
        `/products/productos/${idProducto}/variantes/${idVariante}`,
        varianteData
      )
      console.log(`Variante ${idVariante} actualizada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar variante ${idVariante} del producto ${idProducto}:`, error)
      throw error
    }
  },

  /**
   * Elimina una variante
   * @param {number} idProducto - ID del producto base
   * @param {number} idVariante - ID de la variante a eliminar
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  deleteVariante: async (idProducto, idVariante) => {
    try {
      console.log(`Eliminando variante ${idVariante} del producto ${idProducto}`)
      const response = await axiosInstance.delete(`/products/productos/${idProducto}/variantes/${idVariante}`)
      console.log(`Variante ${idVariante} eliminada exitosamente:`, response.data)
      return response.data
    } catch (error) {
      console.error(`Error al eliminar variante ${idVariante} del producto ${idProducto}:`, error)
      throw error
    }
  }
}

export default ProductosService