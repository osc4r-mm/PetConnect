<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Caregiver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function getAll() {
        $users = User::with('role')->get();
        // Añadir caregiver_id a cada usuario si es cuidador
        $users->transform(function ($user) {
            $caregiver = Caregiver::where('user_id', $user->id)->first();
            $user->caregiver_id = $caregiver ? $caregiver->id : null;
            return $user;
        });
        return response()->json($users);
    }

    public function getOne($userId)
    {
        $user = User::with(['role'])->findOrFail($userId);
        // Buscar caregiver_id si existe
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        $user->caregiver_id = $caregiver ? $caregiver->id : null;
        return response()->json($user);
    }

    public function getPetsFromUser($userId) {
        $user = User::findOrFail($userId);

        // Cargamos las mascotas mediante la relación Eloquent
        $pets = $user->pets()->get();

        // Devolvemos las mascotas en JSON
        return response()->json($pets);
    }

    public function update(Request $request, $userId) {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($userId);
        
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'description' => 'sometimes|string|max:500',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'role_id' => 'sometimes|exists:roles,id',
        ]);

        $user->update($data);
        $user->load('role');
        return response()->json($user);
    }

    public function uploadProfileImage(Request $request, $id) {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        // Verificar que el usuario actual es el mismo que está siendo actualizado
        if (Auth::id() != $id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::findOrFail($id);

        // Eliminar la imagen anterior si existe y no es la default
        if ($user->image && !str_contains($user->image, 'default')) {
                Storage::disk('public')->delete($user->image);
        }

        $path = $request->file('image')->store("users/{$id}", 'public');
        $user->image = $path;
        $user->save();

        return response()->json(['message' => 'Imagen actualizada', 'path' => $path]);
    }

     public function becomeCaregiver($userId) {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($userId);
        
        // Buscar el rol de cuidador
        $caregiverRole = Role::where('name', 'caregiver')->first();
        
        if (!$caregiverRole) {
            return response()->json(['message' => 'Rol de cuidador no encontrado'], 404);
        }
        
        // Comprobar si el usuario ya es un cuidador
        if ($user->role_id === $caregiverRole->id) {
            return response()->json(['message' => 'El usuario ya es un cuidador'], 400);
        }
        
        // Crear un nuevo registro de cuidador
        Caregiver::create([
            'user_id' => $user->id
        ]);
        
        // Actualizar el rol del usuario
        $user->role_id = $caregiverRole->id;
        $user->save();
        
        // Cargar la relación de rol actualizada
        $user->load('role');
        // Añadir caregiver_id
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        $user->caregiver_id = $caregiver ? $caregiver->id : null;

        return response()->json($user);
    }

    public function delete($userId) {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId && !$authenticatedUser->isAdmin()) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($userId);
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }
}