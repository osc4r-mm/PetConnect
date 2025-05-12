<?php

namespace App\Http\Controllers;

use App\Models\NoiseLevel;

class NoiseLevelController extends Controller
{
    public function getNoiseLevels()
    {
        // Devuelve todos los niveles de ruido
        return response()->json(NoiseLevel::all());
    }
}
