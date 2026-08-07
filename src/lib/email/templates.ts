function emailShell(title: string, bodyHtml: string): string {
  return `
  <div style="background:#0a0a0c;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;border-radius:16px;overflow:hidden;">
      <div style="padding:24px 32px;border-bottom:1px solid #2a2a2e;">
        <span style="font-size:18px;font-weight:bold;letter-spacing:1px;color:#f5f0e6;">ARENA <span style="color:#dcae32;">51</span></span>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#f5f0e6;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px;border-top:1px solid #2a2a2e;color:#8b8b93;font-size:12px;">
        Arena 51 Gaming Lounge — thanks for playing with us.
      </div>
    </div>
  </div>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#8b8b93;font-size:13px;">${label}</td>
    <td style="padding:6px 0;color:#f5f0e6;font-size:13px;text-align:right;font-family:monospace;">${value}</td>
  </tr>`;
}

export function bookingConfirmationEmail(params: {
  customerName: string;
  bookingReference: string;
  bookingDate: string;
  startTime: string;
  durationMinutes: number;
  stationName: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
}): { subject: string; html: string; text: string } {
  const subject = `Booking confirmed — ${params.bookingReference}`;
  const html = emailShell(
    'Your booking is confirmed 🎮',
    `
    <p style="color:#c9c9cf;font-size:14px;">Hi ${params.customerName}, your session at Arena 51 is booked.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${row('Reference', params.bookingReference)}
      ${row('Date', params.bookingDate)}
      ${row('Time', params.startTime)}
      ${row('Duration', `${params.durationMinutes} min`)}
      ${row('Station', params.stationName)}
      ${row('Total', `₹${params.totalAmount}`)}
      ${row('Advance paid', `₹${params.advanceAmount}`)}
      ${row('Balance due at lounge', `₹${params.balanceAmount}`)}
    </table>
    <p style="margin-top:20px;color:#8b8b93;font-size:12px;">
      Your preferred game (if any) is just a preference — any available title is yours to play on arrival.
    </p>
    `
  );
  const text = `Booking confirmed — ${params.bookingReference}\nDate: ${params.bookingDate} ${params.startTime}\nStation: ${params.stationName}\nTotal: ₹${params.totalAmount} (Advance paid: ₹${params.advanceAmount}, Balance due: ₹${params.balanceAmount})`;
  return { subject, html, text };
}

export function membershipConfirmationEmail(params: {
  customerName: string;
  membershipName: string;
  price: number;
  expiresAt: string;
}): { subject: string; html: string; text: string } {
  const subject = `${params.membershipName} activated!`;
  const html = emailShell(
    `${params.membershipName} is active 👑`,
    `
    <p style="color:#c9c9cf;font-size:14px;">Hi ${params.customerName}, your membership is now active.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${row('Plan', params.membershipName)}
      ${row('Amount paid', `₹${params.price}`)}
      ${row('Active until', params.expiresAt)}
    </table>
    `
  );
  const text = `${params.membershipName} activated! Active until ${params.expiresAt}.`;
  return { subject, html, text };
}

export function walletTopupEmail(params: {
  customerName: string;
  amount: number;
  newBalance?: number;
}): { subject: string; html: string; text: string } {
  const subject = `₹${params.amount} added to your wallet`;
  const html = emailShell(
    'Wallet topped up 💳',
    `
    <p style="color:#c9c9cf;font-size:14px;">Hi ${params.customerName}, your wallet has been credited.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${row('Amount added', `₹${params.amount}`)}
    </table>
    `
  );
  const text = `₹${params.amount} added to your Arena 51 wallet.`;
  return { subject, html, text };
}
