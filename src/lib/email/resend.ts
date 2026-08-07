import { Resend } from 'resend';
import { bookingConfirmationEmail, membershipConfirmationEmail, walletTopupEmail } from './templates';

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured.');
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

/**
 * Every send in this file is wrapped in try/catch by its caller — a
 * failed or unconfigured email must never block a booking, payment, or
 * membership activation. Resend/Razorpay/Supabase state is always
 * updated first; email is a best-effort notification on top.
 */
async function sendEmail(params: { to: string; subject: string; html: string; text: string }) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    console.warn('RESEND_FROM_EMAIL not set — skipping email send.');
    return;
  }
  const resend = getResendClient();
  await resend.emails.send({ from, to: params.to, subject: params.subject, html: params.html, text: params.text });
}

export async function sendBookingConfirmation(
  to: string,
  params: Parameters<typeof bookingConfirmationEmail>[0]
) {
  const { subject, html, text } = bookingConfirmationEmail(params);
  await sendEmail({ to, subject, html, text });
}

export async function sendMembershipConfirmation(
  to: string,
  params: Parameters<typeof membershipConfirmationEmail>[0]
) {
  const { subject, html, text } = membershipConfirmationEmail(params);
  await sendEmail({ to, subject, html, text });
}

export async function sendWalletTopupConfirmation(
  to: string,
  params: Parameters<typeof walletTopupEmail>[0]
) {
  const { subject, html, text } = walletTopupEmail(params);
  await sendEmail({ to, subject, html, text });
}

export async function sendContactNotification(params: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!from || !to) {
    // Not configured yet — the message is still saved to the database,
    // so this is a soft no-op rather than a hard failure.
    console.warn('RESEND_FROM_EMAIL or CONTACT_NOTIFICATION_EMAIL not set — skipping email notification.');
    return;
  }

  const resend = getResendClient();
  await resend.emails.send({
    from,
    to,
    subject: `New contact form message from ${params.name}`,
    text: [
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      params.phone ? `Phone: ${params.phone}` : null,
      '',
      params.message,
    ]
      .filter(Boolean)
      .join('\n'),
  });
}
