<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function getUsers() {
        $users = User::with('role')->get();
        return response()->json($users);
    }

    public function getUser($userId)
    {
        $user = User::with(['role'])->findOrFail($userId);
        return response()->json($user);
    }

    public function getPetsFromUser($userId) {
        $user = User::findOrFail($userId);

        // Cargamos las mascotas mediante la relación Eloquent
        $pets = $user->pets()->get();

        // Devolvemos las mascotas en JSON
        return response()->json($pets);
    }

    public function updateUser(Request $request, $userId) {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($userId);
        
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'role_id' => 'sometimes|exists:roles,id',
        ]);

        $user->update($data);
        return response()->json($user);
    }

    // Método específico para actualizar solo la ubicación
    public function updateUserLocation(Request $request, $userId) {
        // Verificar si el usuario autenticado es el mismo que se está actualizando
        $authenticatedUser = Auth::user();
        
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso para actualizar la ubicación de este usuario'], 403);
        }

        $user = User::findOrFail($userId);
        
        $data = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $user->update([
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude']
        ]);

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
            $oldPath = str_replace(asset('storage/'), '', $user->image);
            if ($oldPath) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('image')->store("users/{$id}", 'public');
        $fullPath = asset("storage/{$path}");
        
        $user->image = $fullPath;
        $user->save();

        return response()->json(['message' => 'Imagen actualizada', 'path' => $fullPath]);
    }


    public function deleteUser($userId) {
        // También deberíamos verificar permisos aquí
        $authenticatedUser = Auth::user();
        
        if (!$authenticatedUser || ($authenticatedUser->id != $userId && !$authenticatedUser->isAdmin())) {
            return response()->json(['message' => 'No tienes permiso para eliminar este usuario'], 403);
        }
        
        $user = User::findOrFail($userId);
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }
}