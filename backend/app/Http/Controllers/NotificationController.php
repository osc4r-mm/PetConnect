<?php

namespace App\Http\Controllers;

use App\Models\Request as RequestModel;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Notificaciones de solicitudes (enviadas y recibidas) para el usuario autenticado, solo "pending"
    public function getAll(HttpRequest $req)
    {
        $userId = Auth::id();

        // Recibidas
        $received = RequestModel::with(['sender', 'pet'])
            ->where('receiver_id', $userId)
            ->where(function($q) {
                $q->whereIn('status', ['pending', 'rejected'])
                    ->where('created_at', '>=', now()->subDays(7))
                ->orWhere(function($q2) {
                    $q2->where('status', 'accepted')
                        ->where('created_at', '>=', now()->subDays(30));
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Enviadas
        $sent = RequestModel::with(['receiver', 'pet'])
            ->where('sender_id', $userId)
            ->where(function($q) {
                $q->whereIn('status', ['pending', 'rejected'])
                    ->where('created_at', '>=', now()->subDays(7))
                ->orWhere(function($q2) {
                    $q2->where('status', 'accepted')
                        ->where('created_at', '>=', now()->subDays(30));
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'received' => $received,
            'sent' => $sent,
        ]);
    }

    public function accept($id)
{
    $request = RequestModel::findOrFail($id);
    // Solo receptor puede aceptar
    if ($request->receiver_id !== Auth::id()) {
        return response()->json(['error' => 'No autorizado'], 403);
    }
    $request->status = 'accepted';
    $request->save();

    // Si es adopción, cambiar el dueño del perro
    if ($request->type === 'adopt' && $request->pet) {
        $pet = $request->pet;
        $pet->user_id = $request->sender_id;
        $pet->for_sitting = false;
        $pet->for_adoption = false;
        $pet->save();
    }

    return response()->json(['ok' => true, 'status' => 'accepted']);
}

    public function reject($id)
    {
        $request = RequestModel::findOrFail($id);
        // Solo receptor puede rechazar
        if ($request->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $request->status = 'rejected';
        $request->save();
        return response()->json(['ok' => true, 'status' => 'rejected']);
    }

    public function cancel($id)
    {
        $request = RequestModel::findOrFail($id);

        // Solo sender o receiver puede anular si está aceptada
        $userId = Auth::id();
        if (
            $request->status !== 'accepted' ||
            ($request->receiver_id !== $userId && $request->sender_id !== $userId)
        ) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
       
        $request->status = 'cancelled';
        $request->save();
        return response()->json(['ok' => true, 'cancelled' => true]);
    }
}