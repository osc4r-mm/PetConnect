<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\PetPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador para la gestión de mascotas.
 * Permite operaciones CRUD, filtrado, gestión de imágenes de perfil y fotos adicionales.
 */
class PetsController extends Controller
{
    /**
     * Devuelve una lista paginada de mascotas, permitiendo filtrar por
     * nombre, edad, peso, género, características, y finalidad (adopción/cuidado).
     * Incluye relaciones con tablas auxiliares y soporta orden dinámico.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAll(Request $request) {
        $query = Pet::with(['species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel']);

        if ($request->filled('name')) {
            $query->where('name', 'ILIKE', '%' . $request->name . '%');
        }
        if ($request->filled('age_min')) {
            $query->where('age', '>=', $request->age_min);
        }
        if ($request->filled('age_max')) {
            $query->where('age', '<=', $request->age_max);
        }
        if ($request->filled('weight_min')) {
            $query->where('weight', '>=', $request->weight_min);
        }
        if ($request->filled('weight_max')) {
            $query->where('weight', '<=', $request->weight_max);
        }
        if ($request->filled('gender_id')) {
            $query->where('gender_id', $request->gender_id);
        }

        $forAdoption = $request->boolean('for_adoption');
        $forSitting = $request->boolean('for_sitting');

        if ($forAdoption && $forSitting) {
            $query->where(function ($q) {
                $q->where('for_adoption', true)->orWhere('for_sitting', true);
            });
        } elseif ($forAdoption) {
            $query->where('for_adoption', true);
        } elseif ($forSitting) {
            $query->where('for_sitting', true);
        } else {
            $query->where('for_adoption', false)->where('for_sitting', false);
        }

        foreach (['species_id', 'breed_id', 'size_id', 'activity_level_id', 'noise_level_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->$filter);
            }
        }

        $pets = $query->orderBy($request->input('sort_key', 'id'), $request->input('sort_direction', 'asc'))
                      ->paginate(16);

        return response()->json($pets);
    }

    /**
     * Recupera una mascota por su ID, incluyendo todas sus relaciones y fotos.
     *
     * @param int $petId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOne($petId) {
        $pet = Pet::with([
            'species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel', 'photos'
        ])->findOrFail($petId);

        return response()->json($pet);
    }

    /**
     * Crea una nueva mascota, valida los datos y procesa subida de imágenes de perfil y adicionales.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function put(Request $request) {
        $request->validate([
            'name' => 'required|string|max:100',
            'age' => 'required|integer|min:0',
            'gender_id' => 'required|exists:genders,id',
            'weight' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'for_adoption' => 'boolean',
            'for_sitting' => 'boolean',
            'species_id' => 'required|exists:species,id',
            'breed_id' => 'nullable|exists:breeds,id',
            'size_id' => 'nullable|exists:sizes,id',
            'activity_level_id' => 'nullable|exists:activity_levels,id',
            'noise_level_id' => 'nullable|exists:noise_levels,id',
            'profile_image' => 'nullable|image|max:2048',
            'additional_photos.*' => 'nullable|image|max:2048',
        ]);

        $petData = $request->except('profile_image', 'additional_photos');
        $petData['user_id'] = Auth::id();
        $petData['registered_at'] = now();

        $pet = Pet::create($petData);

        if ($request->hasFile('profile_image')) {
            $profileImage = $request->file('profile_image');
            $profilePath = $profileImage->store("pets/{$pet->id}", 'public');
            $pet->profile_path = $profilePath;
            $pet->save();
        }

        if ($request->hasFile('additional_photos')) {
            foreach ($request->file('additional_photos') as $photo) {
                $path = $photo->store("pets/{$pet->id}/extras", 'public');
                PetPhoto::create([
                    'pet_id' => $pet->id,
                    'image_path' => $path,
                    'uploaded_at' => now()
                ]);
            }
        }

        return response()->json([
            'message' => 'Mascota creada exitosamente',
            'pet' => $pet->load(['gender', 'species', 'breed', 'size', 'activityLevel', 'noiseLevel', 'photos'])
        ], 201);
    }

    /**
     * Actualiza los datos de una mascota existente, validando y verificando autorización.
     *
     * @param Request $request
     * @param int $petId
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $petId) {
        $pet = Pet::findOrFail($petId);

        if ($pet->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'age' => 'sometimes|integer|min:0',
            'gender_id' => 'sometimes|exists:genders,id',
            'weight' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'for_adoption' => 'boolean',
            'for_sitting' => 'boolean',
            'species_id' => 'sometimes|exists:species,id',
            'breed_id' => 'nullable|exists:breeds,id',
            'size_id' => 'nullable|exists:sizes,id',
            'activity_level_id' => 'nullable|exists:activity_levels,id',
            'noise_level_id' => 'nullable|exists:noise_levels,id',
        ]);

        $petData = $request->all();
        $pet->update($petData);

        return response()->json([
            'message' => 'Mascota actualizada exitosamente',
            'pet' => $pet->fresh(['gender', 'species', 'breed', 'size', 'activityLevel', 'noiseLevel'])
        ]);
    }

    /**
     * Sube o reemplaza la imagen de perfil (thumbnail) de una mascota.
     * Elimina la anterior si no es la predeterminada.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadThumbnail(Request $request) {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'image' => 'required|image|max:2048',
        ]);

        $pet = Pet::findOrFail($request->pet_id);
        if (Auth::id() !== $pet->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($pet->profile_path && !str_contains($pet->profile_path, 'placeholder')) {
            Storage::disk('public')->delete($pet->profile_path);
        }

        $path = $request->file('image')->store("pets/{$request->pet_id}", 'public');
        $pet->profile_path = $path;
        $pet->save();

        return response()->json(['message' => 'Thumbnail uploaded', 'path' => $path]);
    }

    /**
     * Añade una foto extra a la galería de una mascota.
     *
     * @param Request $request
     * @param int $petId
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadExtraPhoto(Request $request, $petId) {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $pet = Pet::findOrFail($petId);
        if (Auth::id() !== $pet->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $path = $request->file('image')->store("pets/{$petId}/extras", 'public');

        $photo = new PetPhoto();
        $photo->pet_id = $petId;
        $photo->image_path = $path;
        $photo->uploaded_at = now();
        $photo->save();

        return response()->json([
            'message' => 'Extra photo uploaded',
            'path' => $path,
            'photo_id' => $photo->id
        ]);
    }

    /**
     * Elimina una foto extra de la galería de una mascota.
     * Solo el dueño de la mascota puede eliminarla.
     *
     * @param int $photoId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteExtraPhoto($photoId) {
        $photo = PetPhoto::findOrFail($photoId);

        $pet = Pet::findOrFail($photo->pet_id);
        if (Auth::id() !== $pet->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $path = str_replace(asset('storage/'), '', $photo->image_path);

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $photo->delete();

        return response()->json(['message' => 'Photo deleted successfully']);
    }

    /**
     * Elimina una mascota y todas sus imágenes asociadas.
     * Solo el dueño o un administrador pueden eliminar.
     *
     * @param Pet $petId
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete(Pet $petId) {
        $pet = Pet::findOrFail($petId);

        if ($pet->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($pet->profile_path) {
            Storage::disk('public')->delete($pet->profile_path);
        }

        foreach ($pet->photos as $photo) {
            Storage::disk('public')->delete($photo->image_path);
            $photo->delete();
        }

        $pet->delete();

        return response()->json(['message' => 'Mascota eliminada exitosamente']);
    }

    /**
     * Devuelve el usuario propietario de una mascota.
     *
     * @param int $petId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOwner($petId) {
        $pet = Pet::findOrFail($petId);

        $owner = $pet->user;

        if (!$owner) {
            return response()->json(['message' => 'Propietario no encontrado'], 404);
        }

        return response()->json($owner);
    }
}