<?php

namespace App\Http\Controllers;

use App\Models\NoiseLevel;

class NoiseLevelController extends Controller
{
    public function getAll()
    {
        // Devuelve todos los niveles de ruido
        return response()->json(NoiseLevel::all());
    }
}
