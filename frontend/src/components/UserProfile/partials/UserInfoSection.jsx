import React, { useState, useEffect } from 'react';
import { Mail, Camera, UserPlus, UserMinus, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { updateUser, getUserImageUrl, uploadUserProfileImage, getUser, isAdmin } from '../../../services/userService';
import { becomeCaregiver, quitCaregiver, isCaregiver } from '../../../services/caregiverService';
import CaregiverReviewStars from './CaregiverReviewStars';
import api from '../../../services/api';

const UserInfoSection = ({ user, onUserUpdated }) => {
  const { user: currentUser, updateUserData } = useAuth();
  // Estado local para mostrar SIEMPRE datos frescos tras cambios de rol
  const [displayUser, setDisplayUser] = useState(user);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edición
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    description: user.description || ""
  });
  const [formError, setFormError] = useState(null);

  // Nuevo estado para canVote
  const [canVote, setCanVote] = useState(false);

  useEffect(() => {
    setDisplayUser(user);
  }, [user]);

  const isOwnProfile = currentUser && displayUser.id === currentUser.id;
  const userIsCaregiver = isCaregiver(displayUser);
  const userIsAdmin = isAdmin(displayUser);

  useEffect(() => {
    let mounted = true;
    if (userIsCaregiver && !isOwnProfile && displayUser.caregiver_id && currentUser) {
      api.get(`/caregivers/${displayUser.caregiver_id}/can_be_reviewed`)
        .then(res => {
          if (mounted) setCanVote(res.data.canBeReviewedByMe);
        })
        .catch(() => {
          if (mounted) setCanVote(false);
        });
    } else {
      setCanVote(false);
    }
    return () => { mounted = false; }
  }, [userIsCaregiver, isOwnProfile, displayUser.caregiver_id, currentUser]);

  const getRoleBadgeColor = (roleName) => {
    if (!roleName) return 'bg-gray-500';
    const role = roleName.toLowerCase();
    if (role === 'caregiver') return 'bg-green-500';
    if (role === 'user') return 'bg-blue-500';
    if (role === 'admin') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const handleImageChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const response = await uploadUserProfileImage(displayUser.id, file);
      if (response && response.path && updateUserData) {
        // Recarga usuario tras cambiar imagen
        const refreshed = await getUser(displayUser.id);
        setDisplayUser(refreshed);
        if (isOwnProfile) updateUserData(refreshed);
        if (onUserUpdated) onUserUpdated(refreshed);
      }
    } catch (error) {
      console.error('Error al subir la imagen de perfil:', error);
      alert('No se pudo actualizar la imagen de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  // Editar campos del perfil
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm(form => ({ ...form, [name]: value }));
  };

  const handleEdit = () => {
    setForm({
      name: displayUser.name || "",
      email: displayUser.email || "",
      description: displayUser.description || ""
    });
    setFormError(null);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormError(null);
  };

  const handleSave = async () => {
    setFormError(null);
    try {
      const updatedUser = await updateUser(displayUser.id, {
        name: form.name,
        email: form.email,
        description: form.description
      });
      // Recarga usuario tras editar
      const refreshed = await getUser(displayUser.id);
      setDisplayUser(refreshed);
      if (isOwnProfile && updateUserData) updateUserData(refreshed);
      if (onUserUpdated) onUserUpdated(refreshed);
      setEditMode(false);
    } catch (err) {
      setFormError("No se pudo actualizar el perfil. Comprueba los datos.");
    }
  };

  // Convertirse en cuidador
  const handleBecomeCaregiver = async () => {
    setIsProcessing(true);
    try {
      const result = await becomeCaregiver();
      if (result && result.user) {
        // Recarga usuario tras el cambio
        const refreshed = await getUser(result.user.id);
        setDisplayUser(refreshed);
        if (isOwnProfile && updateUserData) updateUserData(refreshed);
        if (onUserUpdated) onUserUpdated(refreshed);
      }
    } catch (error) {
      console.error('Error al convertirse en cuidador:', error);
      alert('No se pudo convertir en cuidador');
    } finally {
      setIsProcessing(false);
    }
  };

  // Darse de baja como cuidador
  const handleQuitCaregiver = async () => {
    if (window.confirm('¿Estás seguro de que quieres dejar de ser cuidador?')) {
      setIsProcessing(true);
      try {
        const result = await quitCaregiver();
        if (result && result.user) {
          // Recarga usuario tras el cambio
          const refreshed = await getUser(result.user.id);
          setDisplayUser(refreshed);
          if (isOwnProfile && updateUserData) updateUserData(refreshed);
          if (onUserUpdated) onUserUpdated(refreshed);
        }
      } catch (error) {
        console.error('Error al darse de baja como cuidador:', error);
        alert('No se pudo dar de baja como cuidador');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        <div className="relative rounded-full overflow-hidden h-32 w-32 mx-auto border-4 border-white shadow-lg">
          <img 
            src={getUserImageUrl(displayUser.image)} 
            alt="Imagen de perfil" 
            className="h-full w-full object-cover"
          />
          {isOwnProfile && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
              {isUploading ? (
                <div className="text-white">Subiendo...</div>
              ) : (
                <>
                  <Camera className="text-white" size={24} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </label>
          )}
        </div>

        {/* Botón editar perfil */}
        {isOwnProfile && !editMode && (
          <button className="flex gap-2 items-center mt-2 px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition text-sm"
            onClick={handleEdit}>
            <Edit3 size={18} /> Editar perfil
          </button>
        )}
        {editMode && (
          <div className="flex gap-2 mt-2">
            <button className="flex gap-2 items-center px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition text-sm"
              onClick={handleSave}>
              <Save size={18} />Guardar
            </button>
            <button className="flex gap-2 items-center px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 transition text-sm"
              onClick={handleCancel}>
              <X size={18} />Cancelar
            </button>
          </div>
        )}

        {/* Review de cuidador: bajo nombre/email/rol */}
        {userIsCaregiver && (
          <CaregiverReviewStars
            caregiverId={displayUser.caregiver_id}
            canVote={canVote}
          />
        )}

        <div className="mt-4 w-full max-w-md">
          {/* Nombre */}
          <div className="mb-2">
            <label className="block text-gray-600 font-medium">Nombre</label>
            {editMode ? (
              <input
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : (
              <div className="text-xl font-bold">{displayUser.name}</div>
            )}
          </div>
          {/* Email */}
          <div className="mb-2">
            <label className="block text-gray-600 font-medium">Email</label>
            {editMode ? (
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleFieldChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : (
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-2" />
                <span>{displayUser.email}</span>
              </div>
            )}
          </div>
          {/* Rol */}
          {displayUser.role?.name && (
            <div className="mb-2">
              <label className="block text-gray-600 font-medium">Rol</label>
              <span className={`${getRoleBadgeColor(displayUser.role.name)} text-white text-sm px-3 py-1 rounded-full`}>
                {displayUser.role.name}
              </span>
            </div>
          )}
          {/* Sobre mí */}
          <div className="mb-2">
            <label className="block text-gray-600 font-medium">Sobre mí</label>
            {editMode ? (
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleFieldChange}
                className="w-full border rounded px-3 py-1 mt-1"
              />
            ) : (
              <p className="text-gray-700">
                {displayUser.description || 'Sin descripción disponible.'}
              </p>
            )}
          </div>
          {/* Error */}
          {formError && (
            <div className="text-red-600 text-sm mb-2">{formError}</div>
          )}
        </div>

        {/* Botones cuidador */}
        {displayUser.role?.name && isOwnProfile && (
          <div className="mt-4 space-y-2 w-full max-w-md">
            {!userIsCaregiver && !userIsAdmin && (
              <button
                onClick={handleBecomeCaregiver}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                {isProcessing ? 'Procesando...' : 'Hacerse cuidador'}
              </button>
            )}
            {userIsCaregiver && (
              <button
                onClick={handleQuitCaregiver}
                disabled={isProcessing}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
              >
                <UserMinus size={18} />
                {isProcessing ? 'Procesando...' : 'Darse de baja como cuidador'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoSection;