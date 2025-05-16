<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;

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

    public function getPet($id) {
        $pet = Pet::with([
            'species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel', 'photos'
        ])->findOrFail($id);

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

        $path = $request->file('image')->store("pets/{$request->pet_id}", 'public');

        $pet = Pet::find($request->pet_id);
        $pet->thumbnail = $path;
        $pet->save();

        return response()->json(['message' => 'Thumbnail uploaded', 'path' => asset("storage/{$path}")]);
    }

    public function uploadExtraPhoto(Request $request, Pet $pet){
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $path = $request->file('image')->store("pets/{$pet->id}/extras", 'public');

        $pet->photos()->create(['url' => $path]);

        return response()->json(['message' => 'Extra photo uploaded', 'path' => asset("storage/{$path}")]);
    }


    public function deletePet(Pet $pet) {
        //
    }
}
