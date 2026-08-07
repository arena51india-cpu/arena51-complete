import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string; avatar_url: string | null } | null;
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-sm text-muted-foreground">
        Be the first to leave a review after your session at Arena 51.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <div key={review.id} className="glass-card p-6">
          <div className="flex items-center gap-0.5 text-gold-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4" fill={i < review.rating ? 'currentColor' : 'none'} />
            ))}
          </div>
          {review.comment && (
            <p className="mt-3 text-sm text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
          )}
          <p className="mt-4 text-sm font-medium">{review.profiles?.full_name ?? 'Arena 51 Player'}</p>
        </div>
      ))}
    </div>
  );
}
