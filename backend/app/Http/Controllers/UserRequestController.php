<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Request as RequestModel;
use App\Models\Pet;
use App\Models\User;

/**
 * Controlador para gestionar las solicitudes realizadas por un usuario (peticiones enviadas).
 * Permite filtrar las solicitudes por tipo y estado, e incluye información de la mascota asociada.
 */
class UserRequestController extends Controller
{
    /**
     * Devuelve las solicitudes enviadas por un usuario, con opción de filtrar por tipo y estado.
     * Incluye los datos de la mascota asociada a cada solicitud.
     *
     * @param  Request $httpRequest  Petición HTTP con posibles filtros 'type' y 'status'.
     * @param  int $userId           ID del usuario emisor de las solicitudes.
     * @return \Illuminate\Http\JsonResponse  Listado de solicitudes filtradas, cada una con su mascota.
     */
    public function getMy(Request $httpRequest, $userId)
    {
        $query = RequestModel::where('sender_id', $userId);

        if ($httpRequest->has('type')) {
            $query->where('type', $httpRequest->query('type'));
        }
        if ($httpRequest->has('status')) {
            $query->where('status', $httpRequest->query('status'));
        }

        $requests = $query->with('pet')->get();

        return response()->json([
            'requests' => $requests
        ]);
    }
}