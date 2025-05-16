<?php

namespace App\Http\Controllers;

use App\Models\Gender;

class GenderController extends Controller
{
    public function getAll()
    {
        // Devuelve todos los géneros
        return response()->json(Gender::all());
    }
}