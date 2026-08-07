import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { sendContactNotification } from '@/lib/email/resend';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().nullable(),
  message: z.string().trim().min(5).max(2000),
});

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`contact:${getClientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many messages sent. Please try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('contact_messages').insert(parsed.data);

  if (error) {
    return NextResponse.json({ error: 'Could not save your message. Please try again.' }, { status: 500 });
  }

  try {
    await sendContactNotification(parsed.data);
  } catch (err) {
    // The message is already saved — a failed notification email
    // shouldn't surface as an error to the visitor.
    console.error('Contact notification email failed:', err);
  }

  return NextResponse.json({ success: true });
}
