<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Caregiver;
use App\Models\CaregiverReview;
use App\Models\Request as RequestModel;

class CaregiverReviewController extends Controller
{
    // app/Http/Controllers/CaregiverReviewController.php
    public function getAll($caregiverId) {
        $caregiver = Caregiver::findOrFail($caregiverId);
        $reviews = CaregiverReview::where('caregiver_id', $caregiverId)->get();
        $avg = $reviews->avg('rating') ?? 0;
        $count = $reviews->count();
        $user_review = null;
        if (auth('sanctum')->user()) {
            $user_review = $reviews->firstWhere('reviewer_id', auth()->id());
        }
        return response()->json([
            'avg' => $avg,
            'count' => $count,
            'user_review' => $user_review ? ['rating' => $user_review->rating] : null,
        ]);
    }

    public function put(Request $request, $caregiverId) {
        $user = $request->user(); // Usuario autenticado (dueño)
        $caregiver = Caregiver::findOrFail($caregiverId); // Objeto caregiver
        $caregiverUserId = $caregiver->user_id; // user_id del cuidador

        // Buscar solicitud aceptada entre cuidador y dueño actual
        $hasHadCare = RequestModel::where('sender_id', $caregiverUserId)
            ->where('receiver_id', $user->id)
            ->where('type', 'care')
            ->where('status', 'accepted')
            ->exists();

        if (!$hasHadCare) {
            return response()->json([
                'error' => 'No puedes valorar a este cuidador.',
                // DEBUG EXTRA por si quieres ver qué ids se están usando realmente
                'debug' => [
                    'caregiver_id' => $caregiverId,
                    'caregiver_user_id' => $caregiverUserId,
                    'current_user_id' => $user->id
                ]
            ], 403);
        }

        $request->validate(['rating' => 'required|integer|min:1|max:5']);
        $review = CaregiverReview::updateOrCreate(
            ['reviewer_id' => $user->id, 'caregiver_id' => $caregiver->id],
            ['rating' => $request->rating, 'reviewed_at' => now()]
        );
        return response()->json(['ok' => true, 'rating' => $review->rating]);
    }

    public function canBeReviewedByMe($caregiverId) {
        $user = auth()->user();
        $caregiver = \App\Models\Caregiver::findOrFail($caregiverId);
        $canBeReviewed = \App\Models\Request::where('sender_id', $caregiver->user_id)
            ->where('receiver_id', $user->id)
            ->where('type', 'care')
            ->where('status', 'accepted')
            ->exists();
        return response()->json(['canBeReviewedByMe' => $canBeReviewed]);
    }
}
