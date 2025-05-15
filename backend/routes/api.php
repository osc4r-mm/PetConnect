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
use App\Http\Controllers\UserController;
use App\Http\Controllers\PetRequestController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Rutas públicas
Route::get('/pets', [PetsController::class, 'getPets']);
Route::get('/pet/{id}', [PetsController::class, 'getPet']);
Route::get('/pet/{id}/owner', [UserController::class, 'getUser']);

Route::get('/users', [UserController::class, 'getUsers']);
Route::get('/user/{id}', [UserController::class, 'getUser']);
Route::delete('/user/{id}', [UserController::class, 'deleteUser']);

// Rutas complementarias
Route::get('/species', [SpeciesController::class, 'getSpecies']);
Route::get('/breeds', [BreedController::class, 'getBreeds']);
Route::get('/sizes', [SizeController::class, 'getSizes']);
Route::get('/activity-levels', [ActivityLevelController::class, 'getActivityLevels']);
Route::get('/noise-levels', [NoiseLevelController::class, 'getNoiseLevels']);
Route::get('/genders', [GenderController::class, 'getGenders']);

// Rutas protegidas (requieren autenticación con Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Rutas de administración
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'user']);

    // Rutas de usuario
    Route::post('/pet/{id}/request', [PetRequestController::class, 'request']);
    Route::put('/user/{id}/location', [UserController::class, 'updateUserLocation']);
    Route::put('/user/{id}', [UserController::class, 'updateUser']);
});
