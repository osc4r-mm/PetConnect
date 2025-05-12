<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetsController;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\BreedController;

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

// Rutas para complementarias
Route::get('/species', [SpeciesController::class, 'getSpecies']);
Route::get('/breeds', [BreedController::class, 'getBreeds']);

// Rutas protegidas (requieren autenticación con Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
