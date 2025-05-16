<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\PetPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PetsController extends Controller
{
    public function getPets(Request $request) {
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

    public function getPet($petId) {
        $pet = Pet::with([
            'species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel', 'photos'
        ])->findOrFail($petId);

        return response()->json($pet);
    }

    public function putPet(Request $request) {
        //
    }

    public function updatePet(Request $request, Pet $pet) {
        //
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
            // Extraer la ruta relativa de la URL completa
            $oldPath = str_replace(asset('storage/'), '', $pet->profile_path);
            if ($oldPath) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('image')->store("pets/{$request->pet_id}", 'public');
        
        // Actualizar la mascota solo con el campo profile_path
        $pet->profile_path = asset("storage/{$path}");
        $pet->save();

        return response()->json(['message' => 'Thumbnail uploaded', 'path' => asset("storage/{$path}")]);
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
        
        // Crear registro de la nueva foto
        $photo = new PetPhoto();
        $photo->pet_id = $petId;
        $photo->image_path = asset("storage/{$path}");
        $photo->uploaded_at = now();
        $photo->save();

        return response()->json([
            'message' => 'Extra photo uploaded', 
            'path' => asset("storage/{$path}"),
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

    public function deletePet(Pet $pet) {
        //
    }
}