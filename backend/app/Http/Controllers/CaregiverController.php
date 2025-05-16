<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Caregiver;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;

class CaregiverController extends Controller
{
    public function activate($userId)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::with(['role', 'caregiver'])->findOrFail($userId);
        
        // Buscar el rol de cuidador
        $caregiverRole = Role::where('name', 'caregiver')->first();
        
        if (!$caregiverRole) {
            return response()->json(['message' => 'Rol de cuidador no encontrado'], 404);
        }
        
        // Comprobar si el usuario ya tiene un registro de cuidador
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        
        if ($caregiver) {
            // Si ya existe, activarlo
            $caregiver->active = true;
            $caregiver->save();
        } else {
            // Crear un nuevo registro de cuidador
            Caregiver::create([
                'user_id' => $user->id,
                'active' => true,
                'hourly_rate' => 0 // Valor por defecto
            ]);
        }
        
        // Actualizar el rol del usuario
        $user->role_id = $caregiverRole->id;
        $user->save();
        
        // Recargar el usuario con las relaciones actualizadas
        $user->load(['role', 'caregiver']);
        
        return response()->json($user);
    }
    
    public function deactivate($userId)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::with(['role', 'caregiver'])->findOrFail($userId);
        
        // Comprobar si el usuario es un cuidador
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        
        if (!$caregiver) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 404);
        }
        
        // Desactivar el cuidador
        $caregiver->active = false;
        $caregiver->save();
        
        // Recargar el usuario con las relaciones actualizadas
        $user->load(['role', 'caregiver']);
        
        return response()->json($user);
    }
    
    public function getAvailable(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'distance' => 'sometimes|numeric|min:1|max:100',
        ]);
        
        // Lógica para buscar cuidadores disponibles
        // Este es un ejemplo, la implementación dependerá de tu base de datos
        // y cómo quieras filtrar por disponibilidad, distancia, etc.
        
        $distance = $request->input('distance', 10); // 10km por defecto
        $date = $request->input('date');
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        
        // Buscar cuidadores activos dentro de la distancia especificada
        // que tengan disponibilidad en la fecha dada
        
        // Esta consulta es un ejemplo y debe adaptarse a tu esquema de base de datos
        $caregivers = User::with(['role', 'caregiver'])
            ->whereHas('caregiver', function($query) {
                $query->where('active', true);
            })
            ->whereHas('role', function($query) {
                $query->where('name', 'caregiver');
            })
            // Aquí podrías añadir filtros por disponibilidad según tu esquema
            ->get();
        
        return response()->json($caregivers);
    }
}