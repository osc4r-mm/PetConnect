<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Caregiver;
use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador para la gestión de cuidadores.
 * Permite a un usuario convertirse en cuidador o darse de baja como tal.
 */
class CaregiverController extends Controller
{
    /**
     * Permite al usuario autenticado convertirse en cuidador.
     * Cambia el rol del usuario y crea el registro Caregiver si no existe.
     *
     * @return \Illuminate\Http\JsonResponse Mensaje de éxito o error, usuario actualizado.
     */
    public function become()
    {
        $user = Auth::user();
        
        if ($user->role && $user->role->name === 'caregiver') {
            return response()->json(['message' => 'El usuario ya es cuidador'], 400);
        }
        
        $caregiverRole = Role::where('name', 'caregiver')->first();
        
        if (!$caregiverRole) {
            return response()->json(['message' => 'Rol de cuidador no encontrado'], 404);
        }
        
        $user->role_id = $caregiverRole->id;
        $user->save();
        
        $caregiver = Caregiver::firstOrCreate(
            ['user_id' => $user->id],
            ['hourly_rate' => 10.00]
        );
        
        return response()->json([
            'message' => 'Ahora eres cuidador',
            'user' => $user->load('role', 'caregiver')
        ]);
    }
    
    /**
     * Permite al usuario autenticado dejar de ser cuidador y volver a ser usuario normal.
     * Elimina el registro Caregiver y solicitudes pendientes/aceptadas de tipo "care".
     *
     * @return \Illuminate\Http\JsonResponse Mensaje de éxito o error, usuario actualizado.
     */
    public function quit()
    {
        $user = Auth::user();
        
        if (!$user->role || $user->role->name !== 'caregiver') {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        $userRole = Role::where('name', 'user')->first();
        
        if (!$userRole) {
            return response()->json(['message' => 'Rol de usuario no encontrado'], 404);
        }
        
        if ($user->caregiver) {
            $user->caregiver()->delete();
        }

        RequestModel::where('sender_id', $user->id)
        ->where('type', 'care')
        ->whereIn('status', ['pending', 'accepted'])
        ->delete();
        
        $user->role_id = $userRole->id;
        $user->save();
        
        return response()->json([
            'message' => 'Has dejado de ser cuidador',
            'user' => $user->load('role')
        ]);
    }
}