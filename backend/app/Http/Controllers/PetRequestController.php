<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pet;
use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\Auth;

class PetRequestController extends Controller
{
    public function put(Request $httpRequest, $id)
    {
        $pet = Pet::findOrFail($id);

        $data = $httpRequest->validate([
            'type'    => 'required|in:adopt,care',
            'message' => 'nullable|string|max:1000',
            'pet_id'  => 'required|exists:pets,id',
            'agreement_data' => 'required_if:type,care',
        ]);

        // Validación extra para asegurar que hay al menos un slot si es "care"
        if ($data['type'] === 'care') {
            $slots = json_decode($data['agreement_data'], true);
            if (empty($slots) || !is_array($slots)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Debes indicar al menos un día y una hora para el cuidado.'
                ], 422);
            }
        }

        $senderId   = Auth::id();
        $receiverId = $pet->user_id;

        if (is_null($receiverId)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Esta mascota no tiene un propietario asignado.'
            ], 400);
        }

        $request = RequestModel::create([
            'sender_id'   => $senderId,
            'receiver_id' => $receiverId,
            'pet_id'      => $pet->id,
            'status'      => 'pending',
            'agreement_data' => $data['agreement_data'] ?? null,
            'type'        => $data['type'],
            'message'     => $data['message'] ?? '',
        ]);

        return response()->json([
            'status'  => 'success',
            'request' => $request->load('pet'),
        ], 201);
    }
}