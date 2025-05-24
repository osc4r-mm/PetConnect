<?php

namespace App\Http\Controllers;

use App\Models\Caregiver;
use App\Models\CaregiverAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador para la gestión de la disponibilidad de los cuidadores.
 * Permite consultar, añadir, actualizar y eliminar los horarios de disponibilidad.
 */
class CaregiverAvailabilityController extends Controller
{
    /**
     * Devuelve la disponibilidad de un cuidador a partir del user_id.
     * Si el usuario no es cuidador, devuelve un array vacío.
     *
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function get($userId)
    {
        $caregiver = Caregiver::where('user_id', $userId)->first();
        if (!$caregiver) {
            return response()->json([], 200);
        }
        $availability = $caregiver->availability()->get()->map(function($item) {
            return [
                'day_of_week' => $item->day_of_week,
                'time_slot' => $item->time_slot,
            ];
        });
        return response()->json($availability);
    }

    /**
     * Devuelve la disponibilidad del cuidador autenticado.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMy(Request $request)
    {
        $user = $request->user();
        $caregiver = Caregiver::where('user_id', $user->id)->first();
        if (!$caregiver) {
            return response()->json([], 200);
        }
        $availabilities = CaregiverAvailability::where('caregiver_id', $caregiver->id)->get();
        return response()->json($availabilities);
    }

    /**
     * Añade o actualiza los slots de disponibilidad para el cuidador autenticado.
     * Solo el propio cuidador puede modificar su disponibilidad.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function put(Request $request, $userId)
    {
        $user = Auth::user();
        if ($user->id != $userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $caregiver = $user->caregiver;
        if (!$caregiver) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        $request->validate([
            'slots' => 'required|array',
            'slots.*.day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'slots.*.time_slot' => 'required|string|size:5',
        ]);
        $newSlots = [];
        foreach ($request->slots as $slot) {
            $newSlots[] = CaregiverAvailability::updateOrCreate(
                [
                    'caregiver_id' => $caregiver->id,
                    'day_of_week' => $slot['day_of_week'],
                    'time_slot' => $slot['time_slot']
                ],
                []
            );
        }
        return response()->json(['message' => 'Disponibilidad actualizada', 'slots' => $newSlots]);
    }

    /**
     * Elimina slots concretos de disponibilidad para el cuidador autenticado.
     *
     * @param Request $request
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete(Request $request, $userId)
    {
        $user = Auth::user();
        if ($user->id != $userId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $caregiver = $user->caregiver;
        if (!$caregiver) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        $request->validate([
            'slots' => 'required|array',
            'slots.*.day_of_week' => 'required',
            'slots.*.time_slot' => 'required'
        ]);
        foreach ($request->slots as $slot) {
            CaregiverAvailability::where([
                'caregiver_id' => $caregiver->id,
                'day_of_week' => $slot['day_of_week'],
                'time_slot' => $slot['time_slot']
            ])->delete();
        }
        return response()->json(['message' => 'Disponibilidad eliminada']);
    }
}