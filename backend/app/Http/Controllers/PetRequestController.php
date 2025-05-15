<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pet;
use App\Models\Request as RequestModel;  // alias para no colisionar con Request de Http
use Illuminate\Support\Facades\Auth;

class PetRequestController extends Controller
{
    public function request(Request $httpRequest, $id)
    {
        $pet = Pet::findOrFail($id);

        // 1) Valida la petición
        $data = $httpRequest->validate([
            'type'    => 'required|in:adopt,care',
            'message' => 'nullable|string|max:1000',
        ]);

        // 2) Determina sender y receiver
        $senderId   = Auth::id();
        $receiverId = $pet->user_id;

        if (is_null($receiverId)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Esta mascota no tiene un propietario asignado.'
            ], 400);
        }

        // 3) Crea la solicitud
        $request = RequestModel::create([
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'type'        => $data['type'],
            'message'     => $data['message'] ?? '',
        ]);

        // 4) Asocia la mascota (tabla pivote request_pets)
        $request->pets()->attach($pet->id);

        // 5) Devuelve respuesta
        return response()->json([
            'status'  => 'success',
            'request' => $request->load('pets'),
        ], 201);
    }
}
