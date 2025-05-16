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
    public function become()
    {
        $user = Auth::user();
        
        // Si ya es cuidador, devolvemos mensaje
        if ($user->role && $user->role->name === 'caregiver') {
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
        
        // Crear registro de cuidador si no existe
        $caregiver = Caregiver::firstOrCreate(
            ['user_id' => $user->id],
            ['hourly_rate' => 10.00] // Valor predeterminado
        );
        
        return response()->json([
            'message' => 'Ahora eres cuidador',
            'user' => $user->load('role', 'caregiver')
        ]);
    }
    
    /**
     * Darse de baja como cuidador (volver a ser usuario normal)
     */
    public function quit()
    {
        $user = Auth::user();
        
        // Verificar que el usuario es cuidador
        if (!$user->role || $user->role->name !== 'caregiver') {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        // Buscar el rol de usuario
        $userRole = Role::where('name', 'user')->first();
        
        if (!$userRole) {
            return response()->json(['message' => 'Rol de usuario no encontrado'], 404);
        }
        
        // Eliminar registro de cuidador
        if ($user->caregiver) {
            $user->caregiver()->delete();
        }
        
        // Cambiar rol a usuario
        $user->role_id = $userRole->id;
        $user->save();
        
        return response()->json([
            'message' => 'Has dejado de ser cuidador',
            'user' => $user->load('role')
        ]);
    }
}