<?php

namespace App\Http\Controllers;

use App\Models\Gender;

class GenderController extends Controller
{
    public function getGenders()
    {
        // Devuelve todos los géneros
        return response()->json(Gender::all());
    }
}