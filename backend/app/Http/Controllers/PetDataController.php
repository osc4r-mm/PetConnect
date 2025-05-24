<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Species;
use App\Models\Breed;
use App\Models\Gender;
use App\Models\Size;
use App\Models\ActivityLevel;
use App\Models\NoiseLevel;

/**
 * Controlador para la obtención de datos auxiliares relacionados con las mascotas.
 * Permite consultar listas de especies, razas, géneros, tamaños, niveles de actividad y ruido.
 */
class PetDataController extends Controller
{
    /**
     * Devuelve todas las especies disponibles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSpecies()
    {
        $species = Species::all();
        return response()->json($species);
    }
    
    /**
     * Devuelve todas las razas disponibles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBreeds()
    {
        $breeds = Breed::all();
        return response()->json($breeds);
    }
    
    /**
     * Devuelve todos los géneros posibles para las mascotas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGenders()
    {
        $genders = Gender::all();
        return response()->json($genders);
    }
    
    /**
     * Devuelve todos los tamaños posibles para las mascotas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSizes()
    {
        $sizes = Size::all();
        return response()->json($sizes);
    }
    
    /**
     * Devuelve todos los niveles de actividad posibles para las mascotas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getActivityLevels()
    {
        $activityLevels = ActivityLevel::all();
        return response()->json($activityLevels);
    }
    
    /**
     * Devuelve todos los niveles de ruido posibles para las mascotas.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNoiseLevels()
    {
        $noiseLevels = NoiseLevel::all();
        return response()->json($noiseLevels);
    }
}