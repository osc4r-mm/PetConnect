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

class PetDataController extends Controller
{
    public function getSpecies()
    {
        $species = Species::all();
        return response()->json($species);
    }
    
    public function getBreeds()
    {
        $breeds = Breed::all();
        return response()->json($breeds);
    }
    
    public function getGenders()
    {
        $genders = Gender::all();
        return response()->json($genders);
    }
    
    public function getSizes()
    {
        $sizes = Size::all();
        return response()->json($sizes);
    }
    
    public function getActivityLevels()
    {
        $activityLevels = ActivityLevel::all();
        return response()->json($activityLevels);
    }
    
    public function getNoiseLevels()
    {
        $noiseLevels = NoiseLevel::all();
        return response()->json($noiseLevels);
    }
}