<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function getUsers()
    {
        $users = User::with('role')->get();
        return response()->json($users);
    }

    public function getUser($id)
    {
        $user = User::with(['role'])->findOrFail($id);
        return response()->json($user);
    }

    public function updateUser(Request $request, $id)
    {
        // Verificar permisos
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $id) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($id);
        
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
    public function updateUserLocation(Request $request, $id)
    {
        // Verificar si el usuario autenticado es el mismo que se está actualizando
        $authenticatedUser = Auth::user();
        
        if (!$authenticatedUser || $authenticatedUser->id != $id) {
            return response()->json(['message' => 'No tienes permiso para actualizar la ubicación de este usuario'], 403);
        }

        $user = User::findOrFail($id);
        
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

    public function deleteUser($id)
    {
        // También deberíamos verificar permisos aquí
        $authenticatedUser = Auth::user();
        
        if (!$authenticatedUser || ($authenticatedUser->id != $id && !$authenticatedUser->isAdmin())) {
            return response()->json(['message' => 'No tienes permiso para eliminar este usuario'], 403);
        }
        
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }
}