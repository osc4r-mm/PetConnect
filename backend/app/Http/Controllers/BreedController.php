<?php

namespace App\Http\Controllers;

use App\Models\Breed;

class BreedController extends Controller
{
    public function getAll()
    {
        // Devuelve todas las razas con su species_id
        return response()->json(Breed::all());
    }
}
