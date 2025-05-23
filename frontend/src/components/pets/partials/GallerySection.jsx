import React, { useState, useMemo } from 'react';
import { ImagePlus, Camera, Trash, Plus } from 'lucide-react';
import { uploadPetThumbnail, uploadPetExtraPhoto, deletePetPhoto } from '../../../services/petImageService';
import { getPetImageUrl } from '../../../services/petService';

const GallerySection = ({ profilePath, photos, name, editable, petId, onPhotosUpdate }) => {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingExtra, setIsUploadingExtra] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(null);

  // Crear un array con todas las imágenes disponibles
  const allPhotos = useMemo(() => {
    const images = profilePath ? [profilePath] : [];
    if (photos && photos.length > 0) {
      photos.forEach(photo => {
        if (photo.image_path) images.push(photo.image_path);
      });
    }
    return images;
  }, [profilePath, photos]);

  // Actualizar la miniatura/imagen principal de la mascota
  const handleThumbnailChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingThumbnail(true);
    try {
      const response = await uploadPetThumbnail(petId, file);
      if (response && response.path) {
        onPhotosUpdate('thumbnail', response.path);
      }
    } catch (error) {
      alert('No se pudo actualizar la imagen principal de la mascota');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Añadir una foto adicional a la mascota
  const handleAddExtraPhoto = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingExtra(true);
    try {
      const response = await uploadPetExtraPhoto(petId, file);
      if (response && response.path) {
        const newPhoto = {
          id: response.photo_id,
          pet_id: petId,
          image_path: response.path
        };
        onPhotosUpdate('extra', newPhoto);
      }
    } catch (error) {
      alert('No se pudo añadir la foto adicional');
    } finally {
      setIsUploadingExtra(false);
    }
  };

  // Eliminar una foto adicional
  const handleDeletePhoto = async (photoId, index) => {
    setIsDeletingPhoto(photoId);
    try {
      await deletePetPhoto(photoId);
      onPhotosUpdate('delete', photoId);
      if (index === activePhoto && allPhotos.length > 1) {
        setActivePhoto(0);
      } else if (index < activePhoto) {
        setActivePhoto(activePhoto - 1);
      }
    } catch (error) {
      alert('No se pudo eliminar la foto');
    } finally {
      setIsDeletingPhoto(null);
    }
  };

  // Si no hay fotos, mostramos un placeholder
  if (allPhotos.length === 0) {
    return (
      <div className="relative rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center" style={{height: '400px'}}>
        <div className="flex flex-col items-center justify-center text-purple-300 h-full">
          <ImagePlus size={48} />
          <p className="mt-2">Sin fotografías disponibles</p>
          {editable && (
            <label className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition">
              Añadir foto principal
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </label>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="relative rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center" style={{height: '400px'}}>
        <img 
          src={getPetImageUrl(allPhotos[activePhoto])} 
          alt={`${name} - foto ${activePhoto + 1}`} 
          className="w-full h-full object-cover"
        />
        {/* Overlay editable para la imagen principal */}
        {editable && activePhoto === 0 && (
          <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
            {isUploadingThumbnail ? (
              <div className="text-white">Subiendo...</div>
            ) : (
              <>
                <Camera className="text-white" size={32} />
                <span className="text-white ml-2">Actualizar imagen principal</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </>
            )}
          </label>
        )}
      </div>
      {/* Carrete de miniaturas */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {allPhotos.map((photoUrl, index) => (
          <div 
            key={index}
            onClick={() => setActivePhoto(index)}
            className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer relative group ${index === activePhoto ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
          >
            <img src={getPetImageUrl(photoUrl)} alt={`${name} - miniatura ${index + 1}`} className="w-full h-full object-cover" />
            {editable && index > 0 && (
              <button 
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  const photoId = photos[index - 1]?.id;
                  if (photoId) handleDeletePhoto(photoId, index);
                }}
                disabled={isDeletingPhoto === photos[index - 1]?.id}
              >
                {isDeletingPhoto === photos[index - 1]?.id ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash size={12} />
                )}
              </button>
            )}
          </div>
        ))}
        {editable && (
          <label 
            className="w-20 h-20 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-blue-400 rounded-md cursor-pointer hover:bg-blue-50 transition"
          >
            {isUploadingExtra ? (
              <div className="text-blue-500 text-sm text-center">Subiendo...</div>
            ) : (
              <>
                <Plus className="w-6 h-6 text-blue-600" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAddExtraPhoto}
                />
              </>
            )}
          </label>
        )}
      </div>
    </>
  );
};

export default GallerySection;