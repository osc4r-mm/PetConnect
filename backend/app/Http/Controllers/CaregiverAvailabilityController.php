<?php

namespace App\Http\Controllers;

use App\Models\Caregiver;
use App\Models\CaregiverAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CaregiverAvailabilityController extends Controller
{
    /**
     * Obtener la disponibilidad de un cuidador
     */
    public function getAvailability($userId)
    {
        // Buscar el cuidador por user_id
        $caregiver = Caregiver::where('user_id', $userId)->first();
        
        if (!$caregiver) {
            return response()->json([], 200); // Devolver array vacío si no existe
        }
        
        // Obtener su disponibilidad
        $availability = $caregiver->availability()->get();
        
        return response()->json($availability);
    }
    
    /**
     * Guardar slots de disponibilidad
     */
    public function saveAvailability(Request $request)
    {
        $user = Auth::user();
        
        // Verificar que el usuario es cuidador
        $caregiver = $user->caregiver;
        
        if (!$caregiver) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        // Validar datos
        $validator = Validator::make($request->all(), [
            'slots' => 'required|array',
            'slots.*.day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'slots.*.time_slot' => 'required|string|size:5',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
        }
        
        // Validar cada time_slot individualmente
        foreach ($request->slots as $slot) {
            if (!preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $slot['time_slot'])) {
                return response()->json([
                    'message' => 'Formato de hora inválido', 
                    'errors' => ['time_slot' => 'El formato debe ser HH:MM (00:00 - 23:59)']
                ], 422);
            }
        }
        
        // Guardar slots
        $savedSlots = [];
        
        foreach ($request->slots as $slot) {
            $availability = CaregiverAvailability::firstOrCreate([
                'caregiver_id' => $caregiver->id,
                'day_of_week' => $slot['day_of_week'],
                'time_slot' => $slot['time_slot'],
            ]);
            
            $savedSlots[] = $availability;
        }
        
        return response()->json($savedSlots);
    }
    
    /**
     * Eliminar slots de disponibilidad
     */
    public function deleteAvailability(Request $request)
    {
        $user = Auth::user();
        
        // Verificar que el usuario es cuidador
        $caregiver = $user->caregiver;
        
        if (!$caregiver) {
            return response()->json(['message' => 'El usuario no es un cuidador'], 400);
        }
        
        // Validar datos
        $validator = Validator::make($request->all(), [
            'slots' => 'required|array',
            'slots.*.day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'slots.*.time_slot' => 'required|string|size:5',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
        }
        
        // Validar cada time_slot individualmente
        foreach ($request->slots as $slot) {
            if (!preg_match('/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/', $slot['time_slot'])) {
                return response()->json([
                    'message' => 'Formato de hora inválido', 
                    'errors' => ['time_slot' => 'El formato debe ser HH:MM (00:00 - 23:59)']
                ], 422);
            }
        }
        
        // Eliminar slots
        foreach ($request->slots as $slot) {
            CaregiverAvailability::where([
                'caregiver_id' => $caregiver->id,
                'day_of_week' => $slot['day_of_week'],
                'time_slot' => $slot['time_slot'],
            ])->delete();
        }
        
        return response()->json(['message' => 'Disponibilidad eliminada correctamente']);
    }
}