<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Caregiver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CaregiverController extends Controller
{
    /**
     * Convertirse en cuidador
     */
    public function become($userId)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }
        
        $user = User::with(['role', 'caregiver'])->findOrFail($userId);
        
        // Si ya es cuidador, devolvemos mensaje
        if ($user->isCaregiver()) {
            return response()->json(['message' => 'El usuario ya es cuidador'], 400);
        }
        
        // Buscar el rol de cuidador
        $caregiverRole = Role::where('name', 'caregiver')->first();
        
        if (!$caregiverRole) {
            return response()->json(['message' => 'Rol de cuidador no encontrado'], 404);
        }
        
        // Cambiar rol a cuidador
        $user->role_id = $caregiverRole->id;
        $user->save();
        
        // Crear registro de cuidador (siempre activo por defecto)
        $caregiver = Caregiver::create([
            'user_id' => $user->id,
            'active' => true, // Activo por defecto
            'hourly_rate' => 10.00 // Valor predeterminado
        ]);
        
        return response()->json([
            'message' => 'Ahora eres cuidador',
            'user' => $user->load('role', 'caregiver')
        ]);
    }
    
    /**
     * Darse de baja como cuidador (volver a ser usuario normal)
     */
    public function quit($userId)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }
        $user = User::with(['role', 'caregiver'])->findOrFail($userId);
        
        // Verificar que el usuario es cuidador
        if (!$user->isCaregiver()) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        // Buscar el rol de usuario
        $userRole = Role::where('name', 'user')->first();
        
        if (!$userRole) {
            return response()->json(['message' => 'Rol de usuario no encontrado'], 404);
        }
        
        // Eliminar registro de cuidador
        $user->caregiver()->delete();
        
        // Cambiar rol a usuario
        $user->role_id = $userRole->id;
        $user->save();
        
        return response()->json([
            'message' => 'Has dejado de ser cuidador',
            'user' => $user->load('role')
        ]);
    }
    
    /**
     * Poner en pausa el rol de cuidador (active = false)
     */
    public function pause($userId)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }
        $user = User::with(['role', 'caregiver'])->findOrFail($userId);
        
        // Verificar que el usuario es cuidador
        if (!$user->isCaregiver()) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        // Buscar el registro de cuidador
        $caregiver = $user->caregiver;
        
        if (!$caregiver) {
            return response()->json(['message' => 'Información de cuidador no encontrada'], 404);
        }
        
        // Desactivar el cuidador
        $caregiver->active = false;
        $caregiver->save();
        
        return response()->json([
            'message' => 'Cuenta de cuidador pausada temporalmente',
            'user' => $user->load('role', 'caregiver')
        ]);
    }
    
    /**
     * Reactivar rol de cuidador (active = true)
     */
    public function resume($userId)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }
        $user = User::with(['role', 'caregiver'])->findOrFail($userId);
        
        // Verificar que el usuario es cuidador
        if (!$user->isCaregiver()) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        // Buscar el registro de cuidador
        $caregiver = $user->caregiver;
        
        if (!$caregiver) {
            return response()->json(['message' => 'Información de cuidador no encontrada'], 404);
        }
        
        // Reactivar el cuidador
        $caregiver->active = true;
        $caregiver->save();
        
        return response()->json([
            'message' => 'Cuenta de cuidador reactivada',
            'user' => $user->load('role', 'caregiver')
        ]);
    }
}