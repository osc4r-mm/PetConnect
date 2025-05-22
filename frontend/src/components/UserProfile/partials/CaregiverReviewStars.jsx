import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getReviews, voteReview } from '../../../services/reviewService';

const STAR_COLOR = '#FFD700';
const STAR_HOVER = '#FFE066';
const STAR_EMPTY = '#E5E7EB';
const STAR_DISABLED = '#FDE68A';

export default function CaregiverReviewStars({ caregiverUserId, canVote }) {
  const [myRating, setMyRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const stars = [1, 2, 3, 4, 5];

  const fetchData = async () => {
    setLoading(true);
    const data = await getReviews(caregiverUserId);
    setAvgRating(data.avg);
    setTotalVotes(data.count);
    setMyRating(data.user_review ? data.user_review.rating : null);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [caregiverUserId]);

  const handleVote = async (value) => {
    if (!canVote || submitting || myRating === value) return;
    setSubmitting(true);
    try {
      const data = await voteReview(caregiverUserId, value);
      setAvgRating(data.avg);
      setTotalVotes(data.count);
      setMyRating(data.user_review ? data.user_review.rating : null);
    } finally {
      setSubmitting(false);
    }
  };

  const getStarColor = (i) => {
    if (!canVote) {
      return (myRating && i <= myRating) ? STAR_DISABLED : STAR_EMPTY;
    }
    if (hoverRating) {
      return i <= hoverRating ? STAR_HOVER : STAR_EMPTY;
    }
    if (myRating) {
      return i <= myRating ? STAR_COLOR : STAR_EMPTY;
    }
    return STAR_EMPTY;
  };

  return (
    <div className="flex flex-col items-center space-y-1 mt-3 mb-2">
      <div className="flex items-center space-x-1">
        {stars.map(i => (
          <button
            key={i}
            type="button"
            disabled={!canVote || submitting}
            className="focus:outline-none"
            onMouseEnter={() => canVote && setHoverRating(i)}
            onMouseLeave={() => canVote && setHoverRating(0)}
            onClick={() => handleVote(i)}
            aria-label={`Valorar con ${i} estrella${i > 1 ? 's' : ''}`}
            style={{
              cursor: canVote ? 'pointer' : 'not-allowed',
              background: 'transparent',
              padding: 0,
            }}
          >
            <Star
              size={28}
              fill={getStarColor(i)}
              stroke={getStarColor(i)}
              style={{
                opacity: hoverRating
                  ? (i <= hoverRating ? 1 : 0.7)
                  : (myRating ? (i <= myRating ? 1 : 0.6) : 0.6),
                transition: 'all 0.15s',
              }}
            />
          </button>
        ))}
        {loading && <span className="ml-2 text-sm text-gray-400">Cargando...</span>}
        {!loading && avgRating !== null && (
          <span className="ml-2 text-yellow-700 font-semibold text-sm">
            {avgRating.toFixed(1)} / 5
          </span>
        )}
        {!loading && totalVotes > 0 && (
          <span className="ml-2 text-xs text-gray-500">({totalVotes} voto{totalVotes !== 1 ? 's' : ''})</span>
        )}
      </div>
      {!canVote && !myRating && (
        <span className="text-gray-500 text-xs">Solo puedes valorar si este cuidador ya ha cuidado una mascota tuya.</span>
      )}
      {canVote && !myRating && (
        <span className="text-gray-600 text-xs">Haz clic para valorar. Puedes cambiar tu voto.</span>
      )}
    </div>
  );
}