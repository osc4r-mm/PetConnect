<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'token' => $token
        ]);
    }

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

        /*
            // Crear un nuevo token
            $token = $employee->createToken($validated['device_name'], [
            $employee->role
            ], now()->addHours(12));

            // Disparar evento de login
            event(new Login('sanctum', $employee, false));
            
            return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data' => [
            'employee' => $employee->only(['id', 'first_name', 'last_name', 'email', 'role']), 'token' => $token->plainTextToken,
            'token_expires_at' => Carbon::parse($token->accessToken->expires_at)->toDateTimeString(),
            ]);
        */
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Usuario autenticado correctamente',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}