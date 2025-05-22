<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CaregiverReview;
use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\Auth;

class CaregiverReviewController extends Controller
{
    // Obtener todas las reviews y la review del usuario autenticado para un cuidador (por user_id)
    public function getAll($caregiverUserId) {
        $caregiver = User::where('id', $caregiverUserId)
            ->whereHas('role', function ($q) { $q->where('name', 'caregiver'); })
            ->firstOrFail();

        $reviews = CaregiverReview::where('caregiver_user_id', $caregiverUserId)->get();
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

    // Votar o actualizar voto
    public function put(Request $request, $caregiverUserId) {
        $user = Auth::user();
        $caregiver = User::where('id', $caregiverUserId)
            ->whereHas('role', function ($q) { $q->where('name', 'caregiver'); })
            ->firstOrFail();

        // Comprobar si el usuario autenticado ha tenido cuidado con este cuidador
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
            ['reviewer_id' => $user->id, 'caregiver_user_id' => $caregiverUserId],
            ['rating' => $request->rating, 'reviewed_at' => now()]
        );

        $reviews = CaregiverReview::where('caregiver_user_id', $caregiverUserId)->get();
        $avg = $reviews->avg('rating') ?? 0;
        $count = $reviews->count();
        $user_review = $reviews->firstWhere('reviewer_id', $user->id);

        return response()->json([
            'avg' => $avg,
            'count' => $count,
            'user_review' => $user_review ? ['rating' => $user_review->rating] : null,
        ]);
    }

    // Saber si el usuario autenticado puede votar a ese cuidador
    public function canBeReviewedByMe($caregiverUserId) {
        $user = Auth::user();
        $caregiver = User::where('id', $caregiverUserId)
            ->whereHas('role', function ($q) { $q->where('name', 'caregiver'); })
            ->firstOrFail();

        $canBeReviewed = RequestModel::where('sender_id', $caregiverUserId)
            ->where('receiver_id', $user->id)
            ->where('type', 'care')
            ->where('status', 'accepted')
            ->exists();

        return response()->json(['canBeReviewedByMe' => $canBeReviewed]);
    }
}