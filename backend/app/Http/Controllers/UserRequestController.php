<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Request as RequestModel;
use App\Models\Pet;
use App\Models\User;

class UserRequestController extends Controller
{
    public function getMy(Request $httpRequest, $userId)
    {
        $query = RequestModel::where('sender_id', $userId);

        // Filtros opcionales
        if ($httpRequest->has('type')) {
            $query->where('type', $httpRequest->query('type'));
        }
        if ($httpRequest->has('status')) {
            $query->where('status', $httpRequest->query('status'));
        }

        // Incluye mascota asociada
        $requests = $query->with('pet')->get();

        return response()->json([
            'requests' => $requests
        ]);
    }
}