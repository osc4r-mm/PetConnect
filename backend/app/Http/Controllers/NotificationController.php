<?php

namespace App\Http\Controllers;

use App\Models\Request;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Notificaciones de solicitudes (enviadas y recibidas) para el usuario autenticado, solo "pending"
    public function index(HttpRequest $req)
    {
        $userId = Auth::id();

        // Recibidas
        $received = Request::with(['sender', 'pet'])
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        // Enviadas
        $sent = Request::with(['receiver', 'pet'])
            ->where('sender_id', $userId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'received' => $received,
            'sent' => $sent,
        ]);
    }
}