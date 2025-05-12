<?php

namespace App\Http\Controllers;

use App\Models\Breed;

class BreedController extends Controller
{
    public function getBreeds()
    {
        // Devuelve todas las razas con su species_id
        return response()->json(Breed::all());
    }
}
