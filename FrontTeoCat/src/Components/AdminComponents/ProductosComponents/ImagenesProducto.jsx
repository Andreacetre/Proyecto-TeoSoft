"use client"

import { useState, useRef } from "react"
import { X, Upload, ImageIcon, Check, AlertCircle, Loader } from 'lucide-react'
import { uploadImageToCloudinary, optimizeCloudinaryUrl } from "../../../Services/uploadImageToCloudinary"

/**
 * Componente para gestionar las imágenes del producto
 * Limitado a 4 imágenes máximo
 * Integrado con Cloudinary para almacenamiento de imágenes
 */
const ImagenesProducto = ({
  formData,
  setFormData,
  formErrors,
}) => {
  // Referencia al input de archivo
  const fileInputRef = useRef(null)
  
  // Estado para manejar errores de carga
  const [uploadError, setUploadError] = useState("")
  
  // Estado para manejar la imagen que se está arrastrando
  const [isDragging, setIsDragging] = useState(false)

  // Estado para controlar las imágenes que están cargando
  const [loadingImages, setLoadingImages] = useState([])

  // Máximo de imágenes permitidas
  const MAX_IMAGES = 4

  // Función para manejar la carga de imágenes
  const handleImageUpload = async (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  
  setUploadError("")
  
  // Obtener imágenes actuales
  let currentImages = []
  if (formData.FotosProducto) {
    currentImages = typeof formData.FotosProducto === 'string'
      ? JSON.parse(formData.FotosProducto)
      : [...formData.FotosProducto]
  }
  
  // Verificar si se excede el límite de imágenes
  if (currentImages.length >= MAX_IMAGES) {
    setUploadError(`Solo se permiten ${MAX_IMAGES} imágenes. Elimina alguna para agregar más.`)
    return
  }
  
  // Calcular cuántas imágenes más se pueden agregar
  const remainingSlots = MAX_IMAGES - currentImages.length
  
  // Validar tipos de archivo y tamaño
  const validFiles = []
  for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
    const file = files[i]
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setUploadError("Solo se permiten archivos de imagen")
      return
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("El tamaño máximo por imagen es de 5MB")
      return
    }
    
    validFiles.push(file)
  }
  
  // Mostrar advertencia si se intentaron cargar más imágenes de las permitidas
  if (files.length > remainingSlots) {
    setUploadError(`Solo se cargarán ${remainingSlots} de las ${files.length} imágenes seleccionadas debido al límite de ${MAX_IMAGES} imágenes.`)
  }
  
  try {
    // Actualizar estado de carga
    setLoadingImages(prev => [...prev, ...validFiles.map(f => f.name)])
    
    // Procesar nuevas imágenes
    for (const file of validFiles) {
      // Crear una URL temporal para vista previa mientras se sube a Cloudinary
      const tempUrl = URL.createObjectURL(file)
      
      // Agregar imagen con URL temporal
      const newImage = {
        url: tempUrl,
        nombre: file.name,
        principal: currentImages.length === 0, // Primera imagen es la principal
        isUploading: true
      }
      
      currentImages.push(newImage)
      
      // Actualizar formData con la URL temporal
      setFormData({
        ...formData,
        FotosProducto: currentImages
      })
      
      try {
        // Subir imagen a Cloudinary
        console.log("Subiendo imagen a Cloudinary:", file.name);
        const cloudinaryUrl = await uploadImageToCloudinary(file, "productos");
        
        if (!cloudinaryUrl) {
          throw new Error("La URL de Cloudinary está vacía");
        }
        
        console.log("URL de Cloudinary recibida:", cloudinaryUrl);
        
        // Verificar que la URL sea válida
        if (!cloudinaryUrl.startsWith('http')) {
          throw new Error("La URL de Cloudinary no es válida: " + cloudinaryUrl);
        }
        
        // Optimizar URL si está disponible la función
        let optimizedUrl = cloudinaryUrl;
        if (typeof optimizeCloudinaryUrl === 'function') {
          optimizedUrl = optimizeCloudinaryUrl(cloudinaryUrl);
          console.log("URL optimizada:", optimizedUrl);
        }
        
        // Verificar que la imagen existe antes de continuar
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("No se puede cargar la imagen desde: " + optimizedUrl));
          img.src = optimizedUrl;
        });
        
        // Actualizar la imagen con la URL de Cloudinary
        const imageIndex = currentImages.findIndex(img => img.url === tempUrl);
        if (imageIndex !== -1) {
          currentImages[imageIndex] = {
            ...currentImages[imageIndex],
            url: optimizedUrl,
            isUploading: false
          };
          
          // Revocar URL temporal para liberar memoria
          URL.revokeObjectURL(tempUrl);
          
          // Actualizar formData con la URL de Cloudinary
          setFormData({
            ...formData,
            FotosProducto: [...currentImages]
          });
        }
      } catch (error) {
        console.error("Error al subir imagen a Cloudinary:", error);
        
        // Marcar la imagen como fallida pero mantenerla en la lista
        const imageIndex = currentImages.findIndex(img => img.url === tempUrl);
        if (imageIndex !== -1) {
          currentImages[imageIndex] = {
            ...currentImages[imageIndex],
            isUploading: false,
            hasError: true,
            errorMessage: error.message
          };
          
          setFormData({
            ...formData,
            FotosProducto: [...currentImages]
          });
        }
        
        setUploadError("Error al subir imagen a Cloudinary: " + error.message);
      }
      
      // Eliminar de la lista de carga
      setLoadingImages(prev => prev.filter(name => name !== file.name));
    }
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (error) {
    console.error("Error general al procesar imágenes:", error);
    setUploadError("Error al subir las imágenes: " + error.message);
    
    // Limpiar estado de carga en caso de error
    setLoadingImages([]);
  }
}

  // Función para eliminar una imagen
  const handleRemoveImage = (index) => {
    // Obtener imágenes actuales
    let currentImages = []
    if (formData.FotosProducto) {
      currentImages = typeof formData.FotosProducto === 'string'
        ? JSON.parse(formData.FotosProducto)
        : [...formData.FotosProducto]
    }
    
    // Verificar si la imagen a eliminar es la principal
    const isRemovingPrincipal = currentImages[index]?.principal
    
    // Si la imagen tiene una URL temporal, revocarla
    const imageUrl = currentImages[index]?.url
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl)
    }
    
    // Eliminar imagen
    currentImages.splice(index, 1)
    
    // Si eliminamos la principal y hay más imágenes, establecer la primera como principal
    if (isRemovingPrincipal && currentImages.length > 0) {
      currentImages[0].principal = true
    }
    
    // Actualizar formData
    setFormData({
      ...formData,
      FotosProducto: currentImages
    })
    
    // Limpiar error si existe
    setUploadError("")
  }

  // Función para establecer una imagen como principal
  const handleSetPrincipal = (index) => {
    // Obtener imágenes actuales
    let currentImages = []
    if (formData.FotosProducto) {
      currentImages = typeof formData.FotosProducto === 'string'
        ? JSON.parse(formData.FotosProducto)
        : [...formData.FotosProducto]
    }
    
    // Actualizar estado principal
    currentImages = currentImages.map((img, i) => ({
      ...img,
      principal: i === index
    }))
    
    // Actualizar formData
    setFormData({
      ...formData,
      FotosProducto: currentImages
    })
  }

  // Función para manejar el arrastre de archivos
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    
    // Crear un objeto similar a e.target.files para reutilizar handleImageUpload
    const fileList = {
      target: {
        files
      }
    }
    
    handleImageUpload(fileList)
  }

  // Obtener imágenes como array
  const getImagesArray = () => {
    if (!formData.FotosProducto) return []
    
    return typeof formData.FotosProducto === 'string'
      ? JSON.parse(formData.FotosProducto)
      : formData.FotosProducto
  }

  const imagesArray = getImagesArray()
  
  // Verificar si se alcanzó el límite de imágenes
  const isMaxImagesReached = imagesArray.length >= MAX_IMAGES
  
  // Verificar si hay imágenes cargando
  const isUploading = loadingImages.length > 0 || imagesArray.some(img => img.isUploading)

  return (
    <div className="mb-4">
      <div className="card">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Imágenes del Producto</h6>
            {isUploading && (
              <div className="d-flex align-items-center text-primary">
                <Loader size={16} className="me-1 animate-spin" />
                <small>Subiendo imágenes...</small>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {/* Contador de imágenes */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Imágenes: {imagesArray.length} de {MAX_IMAGES}</h6>
            {isMaxImagesReached && (
              <span className="badge bg-warning text-dark">
                <AlertCircle size={14} className="me-1" />
                Límite alcanzado
              </span>
            )}
          </div>

          {/* Área de carga de imágenes */}
          {!isMaxImagesReached ? (
            <div 
              className={`upload-area border rounded p-4 text-center mb-3 ${isDragging ? 'bg-light border-primary' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ cursor: isUploading ? 'wait' : 'pointer', minHeight: '150px' }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <div className="py-3">
                {isUploading ? (
                  <>
                    <Loader size={48} className="text-primary mb-2 animate-spin" />
                    <h5>Subiendo imágenes a Cloudinary</h5>
                    <p className="text-muted">Por favor, espera mientras se completa la carga</p>
                  </>
                ) : (
                  <>
                    <Upload size={48} className="text-muted mb-2" />
                    <h5>Arrastra y suelta imágenes aquí</h5>
                    <p className="text-muted">o haz clic para seleccionar archivos</p>
                    <p className="small text-muted">
                      Formatos permitidos: JPG, PNG, GIF, WEBP<br />
                      Tamaño máximo: 5MB por imagen<br />
                      Máximo {MAX_IMAGES} imágenes en total
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-warning mb-3">
              <div className="d-flex align-items-center">
                <AlertCircle size={20} className="me-2" />
                <div>
                  <strong>Límite de imágenes alcanzado</strong>
                  <p className="mb-0">Has alcanzado el límite de {MAX_IMAGES} imágenes. Elimina alguna para agregar más.</p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {uploadError && (
            <div className="alert alert-danger">{uploadError}</div>
          )}
          
          {/* Mensaje de error de validación */}
          {formErrors.FotosProducto && (
            <div className="alert alert-danger">{formErrors.FotosProducto}</div>
          )}

          {/* Previsualización de imágenes */}
          {imagesArray.length > 0 ? (
            <div className="row g-3">
              {imagesArray.map((image, index) => (
                <div key={index} className="col-md-3 col-sm-6 col-6">
                  <div className={`card h-100 ${image.principal ? 'border-primary' : ''}`}>
                    <div className="position-relative">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.nombre || `Imagen ${index + 1}`}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      {image.principal && (
                        <div className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 m-2 rounded-pill">
                          <small>Principal</small>
                        </div>
                      )}
                      {image.isUploading && (
                        <div className="position-absolute top-0 end-0 bg-dark bg-opacity-50 text-white px-2 py-1 m-2 rounded-pill">
                          <div className="d-flex align-items-center">
                            <Loader size={12} className="me-1 animate-spin" />
                            <small>Subiendo...</small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="card-body p-2">
                      <p className="card-text small text-truncate">
                        {image.nombre || `Imagen ${index + 1}`}
                      </p>
                      <div className="d-flex justify-content-between">
                        {!image.principal && !image.isUploading && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSetPrincipal(index)}
                            title="Establecer como imagen principal"
                            disabled={image.isUploading}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-auto"
                          onClick={() => handleRemoveImage(index)}
                          title="Eliminar imagen"
                          disabled={image.isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Espacios vacíos para completar la cuadrícula */}
              {Array.from({ length: MAX_IMAGES - imagesArray.length }).map((_, index) => (
                <div key={`empty-${index}`} className="col-md-3 col-sm-6 col-6">
                  <div 
                    className="card h-100 bg-light border-dashed"
                    style={{ 
                      minHeight: '220px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: isMaxImagesReached || isUploading ? 'default' : 'pointer',
                      borderStyle: 'dashed'
                    }}
                    onClick={() => !isMaxImagesReached && !isUploading && fileInputRef.current?.click()}
                  >
                    <div className="text-center text-muted p-3">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="mb-0">Espacio disponible</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-3">
              {/* Mostrar 4 espacios vacíos cuando no hay imágenes */}
              {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                <div key={`empty-${index}`} className="col-md-3 col-sm-6 col-6">
                  <div 
                    className="card h-100 bg-light border-dashed"
                    style={{ 
                      minHeight: '220px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: isUploading ? 'wait' : 'pointer',
                      borderStyle: 'dashed'
                    }}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <div className="text-center text-muted p-3">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="mb-0">Espacio disponible</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Nota informativa sobre Cloudinary */}
          <div className="alert alert-info mt-3">
            <small>
              <strong>Nota:</strong> Las imágenes se suben automáticamente a Cloudinary para su almacenamiento seguro.
              Para obtener mejores resultados, use imágenes de al menos 800x800 píxeles con fondo blanco.
              Tamaño máximo: 5MB por imagen.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagenesProducto