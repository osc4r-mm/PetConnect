<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Caregiver;
use App\Models\CaregiverReview;
use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\Auth;

class CaregiverReviewController extends Controller
{
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