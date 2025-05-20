import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import api from '../../../services/api';

// Colores para las estrellas
const STAR_COLOR = '#FFD700'; // Amarillo voto real
const STAR_HOVER = '#FFE066'; // Amarillo hover preview
const STAR_EMPTY = '#E5E7EB'; // Gris claro
const STAR_DISABLED = '#FDE68A'; // Amarillo apagado

export default function CaregiverReviewStars({ caregiverId, canVote }) {
  const [myRating, setMyRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const stars = [1, 2, 3, 4, 5];

  // Obtiene la valoración media y la del usuario logueado
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/caregivers/${caregiverId}/reviews`)
      .then(res => {
        if (!mounted) return;
        setAvgRating(res.data.avg);
        setTotalVotes(res.data.count);
        if (res.data.user_review) setMyRating(res.data.user_review.rating);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false };
  }, [caregiverId]);

  // Votar
  const handleVote = async (value) => {
    if (!canVote || submitting || myRating === value) return;
    setSubmitting(true);
    try {
      await api.post(`/caregivers/${caregiverId}/reviews`, { rating: value });
      setMyRating(value);
      // Actualiza media y votos
      const res = await api.get(`/caregivers/${caregiverId}/reviews`);
      setAvgRating(res.data.avg);
      setTotalVotes(res.data.count);
    } finally {
      setSubmitting(false);
    }
  };

  // Color de estrella (hover > voto propio > vacía)
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
    <div className="flex flex-col items-start space-y-1 mt-3 mb-2">
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
      {myRating && (
        <span className="text-green-700 text-xs">¡Ya has valorado este cuidador!</span>
      )}
      {!canVote && !myRating && (
        <span className="text-gray-500 text-xs">Solo puedes valorar si este cuidador ya ha cuidado una mascota tuya.</span>
      )}
      {canVote && !myRating && (
        <span className="text-gray-600 text-xs">Haz clic para valorar. Puedes cambiar tu voto.</span>
      )}
    </div>
  );
}