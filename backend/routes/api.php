<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetsController;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\BreedController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\ActivityLevelController;
use App\Http\Controllers\NoiseLevelController;
use App\Http\Controllers\GenderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/pets', [PetsController::class, 'index']);
Route::get('/pets/{id}', [PetsController::class, 'show']);

// Rutas complementarias
Route::get('/species', [SpeciesController::class, 'getSpecies']);
Route::get('/breeds', [BreedController::class, 'getBreeds']);
Route::get('/sizes', [SizeController::class, 'getSizes']);
Route::get('/activity-levels', [ActivityLevelController::class, 'getActivityLevels']);
Route::get('/noise-levels', [NoiseLevelController::class, 'getNoiseLevels']);
Route::get('/genders', [GenderController::class, 'getGenders']);

// Rutas protegidas (requieren autenticación con Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
