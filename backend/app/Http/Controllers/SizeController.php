<?php

namespace App\Http\Controllers;

use App\Models\Size;

class SizeController extends Controller
{
    public function getAll()
    {
        // Devuelve todos los tamaños
        return response()->json(Size::all());
    }
}
