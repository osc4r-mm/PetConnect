<?php

namespace App\Http\Controllers;

use App\Models\Size;

class SizeController extends Controller
{
    public function getSizes()
    {
        // Devuelve todos los tamaños
        return response()->json(Size::all());
    }
}
