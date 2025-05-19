<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetsController;
use App\Http\Controllers\PetDataController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PetRequestController;
use App\Http\Controllers\CaregiverController;
use App\Http\Controllers\CaregiverAvailabilityController;
use App\Http\Controllers\NotificationController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas de mascotas
Route::get('/pets', [PetsController::class, 'getAll']);
Route::get('/pet/{petId}', [PetsController::class, 'getOne']);
Route::get('/pet/{PetId}/owner', [PetsController::class, 'getOwner']);

// Rutas de usuarios
Route::get('/users', [UserController::class, 'getAll']);
Route::get('/user/{userId}', [UserController::class, 'getOne']);
Route::get('/user/{userId}/pets', [UserController::class, 'getPetsFromUser']);
Route::delete('/user/{userId}', [UserController::class, 'delete']);

// Rutas complementarias
Route::get('/species', [PetDataController::class, 'getSpecies']);
Route::get('/breeds', [PetDataController::class, 'getBreeds']);
Route::get('/sizes', [PetDataController::class, 'getSizes']);
Route::get('/activity-levels', [PetDataController::class, 'getActivityLevels']);
Route::get('/noise-levels', [PetDataController::class, 'getNoiseLevels']);
Route::get('/genders', [PetDataController::class, 'getGenders']);

// Rutas protegidas (requieren autenticación con Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'user']);
    Route::get('/notifications', [NotificationController::class, 'index']);
   
    // Rutas de mascotas
    Route::post('/pet', [PetsController::class, 'put']);
    Route::put('/pet/{petId}', [PetsController::class, 'update']);
    Route::delete('/pet/{petId}', [PetsController::class, 'delete']);

    Route::post('/pet/{petId}/request', [PetRequestController::class, 'put']);
    Route::post('/pet/upload-thumbnail', [PetsController::class, 'uploadThumbnail']);
    Route::post('/pet/{petId}/upload-extra-photo', [PetsController::class, 'uploadExtraPhoto']);
    Route::delete('/pet-photos/{photoId}', [PetsController::class, 'deleteExtraPhoto']);
    
    // Rutas de usuario
    Route::put('/user/{userId}', [UserController::class, 'update']);
    Route::post('/user/{id}/upload-image', [UserController::class, 'uploadProfileImage']);
    
    // Rutas de cuidadores
    Route::post('/caregivers/{userId}/become', [CaregiverController::class, 'become']);
    Route::post('/caregivers/{userId}/quit', [CaregiverController::class, 'quit']);
    Route::get('/caregivers/{userId}/availability', [CaregiverAvailabilityController::class, 'getAvailability']);
    Route::post('/caregivers/availability', [CaregiverAvailabilityController::class, 'saveAvailability']);
    Route::delete('/caregivers/availability', [CaregiverAvailabilityController::class, 'deleteAvailability']);

});
