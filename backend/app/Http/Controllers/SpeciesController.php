<?php

namespace App\Http\Controllers;

use App\Models\Species;

class SpeciesController extends Controller
{
    public function getAll()
    {
        // Devuelve todas las especies
        return response()->json(Species::all());
    }
}
