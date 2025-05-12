<?php

namespace App\Http\Controllers;

use App\Models\ActivityLevel;

class ActivityLevelController extends Controller
{
    public function getActivityLevels()
    {
        // Devuelve todos los niveles de actividad
        return response()->json(ActivityLevel::all());
    }
}
