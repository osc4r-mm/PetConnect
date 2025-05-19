<?php

namespace App\Http\Controllers;

use App\Models\Caregiver;
use App\Models\CaregiverAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CaregiverAvailabilityController extends Controller
{
    // Mapeo de nombres de días a valores numéricos
    private $dayMapping = [
        'monday' => 1,
        'tuesday' => 2,
        'wednesday' => 3,
        'thursday' => 4,
        'friday' => 5,
        'saturday' => 6,
        'sunday' => 7
    ];

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

    public function getMy(Request $request)
    {
        $user = $request->user(); // Usuario autenticado por Sanctum

        // Busca todas las disponibilidades donde el caregiver_id sea el id del usuario autenticado
        $availabilities = CaregiverAvailability::where('caregiver_id', $user->id)->get();

        return response()->json($availabilities);
    }

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