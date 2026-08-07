'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

export function ReviewForm({ bookingId, profileId }: { bookingId: string; profileId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      profile_id: profileId,
      booking_id: bookingId,
      rating,
      comment: comment || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error('Could not submit your review.');
      return;
    }
    setSubmitted(true);
    toast.success('Thanks for the feedback!');
    router.refresh();
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">Your review is pending publication. Thank you!</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}>
            <Star
              className={`h-6 w-6 ${n <= rating ? 'text-gold-400' : 'text-white/20'}`}
              fill={n <= rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="How was your session?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button variant="gold" size="sm" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Review'}
      </Button>
    </div>
  );
}
