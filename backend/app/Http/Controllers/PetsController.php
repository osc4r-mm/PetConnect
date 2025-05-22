<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\PetPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PetsController extends Controller
{
    public function getAll(Request $request) {
        $query = Pet::with(['species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel']);

        // Filtros básicos
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

        // Adopción y cuidado
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

        // Relaciones adicionales
        foreach (['species_id', 'breed_id', 'size_id', 'activity_level_id', 'noise_level_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->$filter);
            }
        }

        // Orden y paginación
        $pets = $query->orderBy($request->input('sort_key', 'id'), $request->input('sort_direction', 'asc'))
                      ->paginate(16);

        return response()->json($pets);
    }

    public function getOne($petId) {
        $pet = Pet::with([
            'species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel', 'photos'
        ])->findOrFail($petId);

        return response()->json($pet);
    }

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
        
        // Create pet with user ID
        $petData = $request->except('profile_image', 'additional_photos');
        $petData['user_id'] = Auth::id();
        $petData['registered_at'] = now();
        
        // Handle profile image if provided
        if ($request->hasFile('profile_image')) {
            $profileImage = $request->file('profile_image');
            $profilePath = $profileImage->store('pets/profiles', 'public');
            $petData['profile_path'] = $profilePath;
        }
        
        $pet = Pet::create($petData);
        
        // Handle additional photos if provided
        if ($request->hasFile('additional_photos')) {
            foreach ($request->file('additional_photos') as $photo) {
                $path = $photo->store('pets/photos', 'public');
                
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

    public function update(Request $request, $petId) {
        $pet = Pet::findOrFail($petId);
        
        // Check if user owns this pet
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
            'pet' => $pet->fresh(['gender', 'species', 'breed', 'size', 'activityLevel', 'noiseLevel', 'photos'])
        ]);
    }

    public function uploadThumbnail(Request $request) {
        $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'image' => 'required|image|max:2048',
        ]);

        // Verificar que el usuario actual es el dueño de la mascota
        $pet = Pet::findOrFail($request->pet_id);
        if (Auth::id() !== $pet->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Eliminar la imagen anterior si existe y no es la default
        if ($pet->profile_path && !str_contains($pet->profile_path, 'placeholder')) {
            Storage::disk('public')->delete($pet->profile_path);
        }

        $path = $request->file('image')->store("pets/{$request->pet_id}", 'public');
        $pet->profile_path = $path;
        $pet->save();

        return response()->json(['message' => 'Thumbnail uploaded', 'path' => $path]);
    }

    public function uploadExtraPhoto(Request $request, $petId) {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        // Verificar que el usuario actual es el dueño de la mascota
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

    public function deleteExtraPhoto($photoId) {
        $photo = PetPhoto::findOrFail($photoId);
        
        // Verificar que el usuario actual es el dueño de la mascota
        $pet = Pet::findOrFail($photo->pet_id);
        if (Auth::id() !== $pet->user_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        // Extraer la ruta del archivo para eliminar del storage
        $path = str_replace(asset('storage/'), '', $photo->image_path);
        
        // Eliminar el archivo del almacenamiento
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
        
        // Eliminar el registro de la base de datos
        $photo->delete();
        
        return response()->json(['message' => 'Photo deleted successfully']);
    }

    public function delete(Pet $petId) {
        $pet = Pet::findOrFail($petId);
        
        // Check if user owns this pet
        if ($pet->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        // Delete profile image if exists
        if ($pet->profile_path) {
            Storage::disk('public')->delete($pet->profile_path);
        }
        
        // Delete all pet photos
        foreach ($pet->photos as $photo) {
            Storage::disk('public')->delete($photo->image_path);
            $photo->delete();
        }
        
        $pet->delete();
        
        return response()->json(['message' => 'Mascota eliminada exitosamente']);
    }

    public function getOwner($petId){
    $pet = Pet::findOrFail($petId);
    
    // Obtener el usuario dueño de la mascota
    $owner = $pet->user;
    
    if (!$owner) {
        return response()->json(['message' => 'Propietario no encontrado'], 404);
    }
    
    return response()->json([
        'id' => $owner->id,
        'name' => $owner->name,
        'email' => $owner->email,
        'profile_path' => $owner->profile_path,
        'phone' => $owner->phone,
        'location' => $owner->location,
    ]);
}
}