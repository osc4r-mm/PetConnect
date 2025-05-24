<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\Caregiver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * Controlador para la gestión de usuarios.
 * Incluye operaciones para obtención, actualización, eliminación de usuarios,
 * gestión de imagen de perfil, roles y relación con cuidadores y mascotas.
 */
class UserController extends Controller
{
    /**
     * Devuelve todos los usuarios con su rol y, si es cuidador, el caregiver_id asociado.
     *
     * @return \Illuminate\Http\JsonResponse Lista de usuarios con sus roles y caregiver_id.
     */
    public function getAll() {
        $users = User::with('role')->get();
        $users->transform(function ($user) {
            $caregiver = Caregiver::where('user_id', $user->id)->first();
            $user->caregiver_id = $caregiver ? $caregiver->id : null;
            return $user;
        });
        return response()->json($users);
    }

    /**
     * Devuelve la información de un usuario específico, incluyendo su rol
     * y caregiver_id si es cuidador.
     *
     * @param  int $userId  ID del usuario a consultar.
     * @return \Illuminate\Http\JsonResponse Datos del usuario.
     */
    public function getOne($userId)
    {
        $user = User::with(['role'])->findOrFail($userId);
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        $user->caregiver_id = $caregiver ? $caregiver->id : null;
        return response()->json($user);
    }

    /**
     * Devuelve la lista de mascotas asociadas a un usuario.
     *
     * @param  int $userId  ID del usuario.
     * @return \Illuminate\Http\JsonResponse Listado de mascotas.
     */
    public function getPetsFromUser($userId) {
        $user = User::findOrFail($userId);
        $pets = $user->pets()->get();
        return response()->json($pets);
    }

    /**
     * Actualiza los datos de un usuario autenticado.
     * Permite actualizar nombre, email, descripción, latitud, longitud y rol.
     *
     * @param  Request $request
     * @param  int $userId
     * @return \Illuminate\Http\JsonResponse Usuario actualizado o error de permisos.
     */
    public function update(Request $request, $userId) {
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

    /**
     * Sube una imagen de perfil para el usuario autenticado.
     * Elimina la imagen anterior si no es la predeterminada.
     *
     * @param  Request $request
     * @param  int $id  ID del usuario.
     * @return \Illuminate\Http\JsonResponse Mensaje de éxito o error de autorización.
     */
    public function uploadProfileImage(Request $request, $id) {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        if (Auth::id() != $id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->image && !str_contains($user->image, 'default')) {
            Storage::disk('public')->delete($user->image);
        }

        $path = $request->file('image')->store("users/{$id}", 'public');
        $user->image = $path;
        $user->save();

        return response()->json(['message' => 'Imagen actualizada', 'path' => $path]);
    }

    /**
     * Convierte a un usuario autenticado en cuidador.
     * Cambia su rol y crea el registro de cuidador.
     *
     * @param  int $userId  ID del usuario.
     * @return \Illuminate\Http\JsonResponse Usuario actualizado o error.
     */
    public function becomeCaregiver($userId) {
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($userId);
        $caregiverRole = Role::where('name', 'caregiver')->first();

        if (!$caregiverRole) {
            return response()->json(['message' => 'Rol de cuidador no encontrado'], 404);
        }
        if ($user->role_id === $caregiverRole->id) {
            return response()->json(['message' => 'El usuario ya es un cuidador'], 400);
        }

        Caregiver::create([
            'user_id' => $user->id
        ]);
        $user->role_id = $caregiverRole->id;
        $user->save();
        $user->load('role');
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        $user->caregiver_id = $caregiver ? $caregiver->id : null;

        return response()->json($user);
    }

    /**
     * Elimina un usuario si es el propio usuario autenticado o un administrador.
     *
     * @param  int $userId  ID del usuario.
     * @return \Illuminate\Http\JsonResponse Mensaje de éxito o error de permisos.
     */
    public function delete($userId) {
        $authenticatedUser = Auth::user();
        if (!$authenticatedUser || $authenticatedUser->id != $userId && !$authenticatedUser->isAdmin()) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        $user = User::findOrFail($userId);
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }
}