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
Route::get('/pet/{petId}', [PetsController::class, 'getPet']);
Route::get('/pet/{petId}/owner', [UserController::class, 'getUser']);

Route::get('/users', [UserController::class, 'getUsers']);
Route::get('/user/{userId}', [UserController::class, 'getUser']);
Route::get('/user/{userId}/pets', [UserController::class, 'getPetsFromUser']);
Route::delete('/user/{userId}', [UserController::class, 'deleteUser']);

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
    Route::get('/profile', [AuthController::class, 'user']);
    Route::post('/pet/{petId}/request', [PetRequestController::class, 'request']);
    Route::put('/user/{userId}/location', [UserController::class, 'updateUserLocation']);
    Route::put('/user/{userId}', [UserController::class, 'updateUser']);
    Route::post('/pet/upload-thumbnail', [PetsController::class, 'uploadThumbnail']);
    Route::post('/pet/{petId}/upload-extra-photo', [PetsController::class, 'uploadExtraPhoto']);
    Route::delete('/pet-photos/{photoId}', [PetsController::class, 'deleteExtraPhoto']);
});
