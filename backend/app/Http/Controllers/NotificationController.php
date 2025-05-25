<?php

namespace App\Http\Controllers;

use App\Models\Request as RequestModel;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador para la gestión de notificaciones relacionadas con solicitudes de cuidado o adopción.
 * Permite al usuario autenticado consultar, aceptar, rechazar o cancelar solicitudes.
 */
class NotificationController extends Controller
{
    /**
     * Devuelve todas las notificaciones relevantes (solicitudes recibidas y enviadas)
     * para el usuario autenticado. Incluye solo solicitudes recientes y pendientes/rechazadas/aceptadas.
     * Añade el campo "schedule" en solicitudes de tipo "care".
     *
     * @param HttpRequest $req
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAll(HttpRequest $req)
    {
        $userId = Auth::id();

        // Solicitudes recibidas
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

        // Solicitudes enviadas
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

        // Añadir el campo "schedule" si es de tipo "care"
        $received = $received->map(function($req) {
            $reqArray = $req->toArray();
            if ($req->type === 'care' && !empty($req->agreement_data)) {
                $reqArray['schedule'] = $req->agreement_data;
            }
            return $reqArray;
        });

        $sent = $sent->map(function($req) {
            $reqArray = $req->toArray();
            if ($req->type === 'care' && !empty($req->agreement_data)) {
                $reqArray['schedule'] = $req->agreement_data;
            }
            return $reqArray;
        });

        return response()->json([
            'received' => $received,
            'sent' => $sent,
        ]);
    }

    /**
     * Permite al receptor aceptar una solicitud. Si es de adopción,
     * transfiere la propiedad de la mascota al emisor y actualiza los flags.
     *
     * @param int $id ID de la solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function accept($id)
    {
        $request = RequestModel::findOrFail($id);
        if ($request->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $request->status = 'accepted';
        $request->save();

        // Si es adopción, transferir la mascota
        if ($request->type === 'adopt' && $request->pet) {
            $pet = $request->pet;
            $pet->user_id = $request->sender_id;
            $pet->for_sitting = false;
            $pet->for_adoption = false;
            $pet->save();
        }

        return response()->json(['ok' => true, 'status' => 'accepted']);
    }

    /**
     * Permite al receptor rechazar una solicitud.
     *
     * @param int $id ID de la solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject($id)
    {
        $request = RequestModel::findOrFail($id);
        if ($request->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $request->status = 'rejected';
        $request->save();
        return response()->json(['ok' => true, 'status' => 'rejected']);
    }

    /**
     * Permite al emisor o receptor cancelar una solicitud aceptada.
     *
     * @param int $id ID de la solicitud
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel($id)
    {
        $request = RequestModel::findOrFail($id);

        $userId = Auth::id();
        if ($request->status !== 'accepted' || ($request->receiver_id !== $userId && $request->sender_id !== $userId)) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->status = 'cancelled';
        $request->save();
        return response()->json(['ok' => true, 'cancelled' => true]);
    }
}