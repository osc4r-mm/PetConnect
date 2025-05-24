<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

/**
 * Controlador de autenticación de usuarios.
 * Gestiona el registro, login, logout y recuperación de usuario autenticado mediante tokens.
 */
class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario con validación de datos, crea el usuario
     * y genera un token de autenticación.
     * 
     * @param  Request  $request  Petición HTTP con nombre, email y contraseña (confirmada).
     * @return \Illuminate\Http\JsonResponse  Respuesta con usuario creado y token.
     */
    public function register(Request $request)
    {
         $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
            ],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->load('role');
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Autentica un usuario existente usando email y contraseña.
     * Si las credenciales son correctas, genera y devuelve un token.
     * 
     * @param  Request  $request  Petición HTTP con email y contraseña.
     * @return \Illuminate\Http\JsonResponse  Respuesta con usuario autenticado y token.
     * @throws ValidationException  Si las credenciales son incorrectas.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->load('role');
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Usuario autenticado correctamente',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Cierra la sesión del usuario autenticado eliminando el token actual.
     * 
     * @param  Request  $request  Petición HTTP autenticada.
     * @return \Illuminate\Http\JsonResponse  Respuesta de éxito.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Devuelve la información del usuario autenticado, incluyendo su rol.
     * 
     * @param  Request  $request  Petición HTTP autenticada.
     * @return \Illuminate\Http\JsonResponse  Usuario autenticado.
     */
    public function user(Request $request)
    {
        $user = $request->user()->load('role');
        return response()->json($request->user());
    }
}