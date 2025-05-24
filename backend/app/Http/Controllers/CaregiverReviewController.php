<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Caregiver;
use App\Models\CaregiverReview;
use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\Auth;

/**
 * Controlador para la gestión de valoraciones de cuidadores.
 * Permite consultar, crear o actualizar valoraciones y verificar si un usuario puede valorar a un cuidador.
 */
class CaregiverReviewController extends Controller
{
    /**
     * Devuelve la media, el conteo y, si existe, la valoración del usuario autenticado sobre un cuidador.
     *
     * @param int $caregiverId ID del cuidador.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAll($caregiverId) {
        $caregiver = Caregiver::findOrFail($caregiverId);
        $reviews = CaregiverReview::where('caregiver_id', $caregiverId)->get();
        $avg = $reviews->avg('rating') ?? 0;
        $count = $reviews->count();

        $user = Auth::user();
        $user_review = null;
        if ($user) {
            $user_review = $reviews->firstWhere('reviewer_id', $user->id);
        }

        return response()->json([
            'avg' => $avg,
            'count' => $count,
            'user_review' => $user_review ? ['rating' => $user_review->rating] : null,
        ]);
    }

    /**
     * Permite al usuario autenticado valorar a un cuidador si ha recibido un servicio de él.
     * Valida la puntuación y actualiza o crea la valoración correspondiente.
     * 
     * @param Request $request
     * @param int $caregiverId
     * @return \Illuminate\Http\JsonResponse
     */
    public function put(Request $request, $caregiverId) {
        $user = Auth::user();
        $caregiver = Caregiver::findOrFail($caregiverId);
        $caregiverUserId = $caregiver->user_id;

        $hasHadCare = RequestModel::where('sender_id', $caregiverUserId)
            ->where('receiver_id', $user->id)
            ->where('type', 'care')
            ->where('status', 'accepted')
            ->exists();

        if (!$hasHadCare) {
            return response()->json([
                'error' => 'No puedes valorar a este cuidador.',
            ], 403);
        }

        $request->validate(['rating' => 'required|integer|min:1|max:5']);
        $review = CaregiverReview::updateOrCreate(
            ['reviewer_id' => $user->id, 'caregiver_id' => $caregiver->id],
            ['rating' => $request->rating, 'reviewed_at' => now()]
        );

        $reviews = CaregiverReview::where('caregiver_id', $caregiverId)->get();
        $avg = $reviews->avg('rating') ?? 0;
        $count = $reviews->count();
        $user_review = $reviews->firstWhere('reviewer_id', $user->id);

        return response()->json([
            'avg' => $avg,
            'count' => $count,
            'user_review' => $user_review ? ['rating' => $user_review->rating] : null,
        ]);
    }

    /**
     * Indica si el usuario autenticado puede valorar al cuidador (si ha recibido su servicio).
     *
     * @param int $caregiverId
     * @return \Illuminate\Http\JsonResponse
     */
    public function canBeReviewedByMe($caregiverId) {
        $user = Auth::user();
        $caregiver = Caregiver::findOrFail($caregiverId);
        $canBeReviewed = RequestModel::where('sender_id', $caregiver->user_id)
            ->where('receiver_id', $user->id)
            ->where('type', 'care')
            ->where('status', 'accepted')
            ->exists();
        return response()->json(['canBeReviewedByMe' => $canBeReviewed]);
    }
}