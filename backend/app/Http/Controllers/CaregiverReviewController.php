<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Caregiver;
use App\Models\CaregiverReview;

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
        $user = $request->user();
        $caregiver = Caregiver::findOrFail($caregiverId);
        // Solo puedes votar si este cuidador ha cuidado una mascota tuya:
        $hasHadCare = \App\Models\Request::where('receiver_id', $caregiver->user_id)
            ->where('sender_id', $user->id)
            ->where('type', 'care')
            ->where('status', 'accepted')
            ->exists();
        if (!$hasHadCare) {
            return response()->json(['error' => 'No puedes valorar a este cuidador.'], 403);
        }
        $request->validate(['rating' => 'required|integer|min:1|max:5']);
        $review = CaregiverReview::updateOrCreate(
            ['reviewer_id' => $user->id, 'caregiver_id' => $caregiver->id],
            ['rating' => $request->rating, 'reviewed_at' => now()]
        );
        return response()->json(['ok' => true, 'rating' => $review->rating]);
    }
}
