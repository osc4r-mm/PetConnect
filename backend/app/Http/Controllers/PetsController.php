<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;

class PetsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getPets(Request $request)
    {
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

    /**
     * Store a newly created resource in storage.
     */
    public function putPet(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function getPet($id)
    {
        $pet = Pet::with([
            'species', 'breed', 'size', 'gender', 'activityLevel', 'noiseLevel', 'photos'
        ])->findOrFail($id);

        return response()->json($pet);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updatePet(Request $request, Pet $pet)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function deletePet(Pet $pet)
    {
        //
    }
}
