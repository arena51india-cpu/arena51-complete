'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyINR } from '@/lib/utils';

interface InvoiceBooking {
  booking_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  base_amount: number;
  surcharge_amount: number;
  discount_amount: number;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  payment_status: string;
  created_at: string;
}

export function InvoiceCard({ booking }: { booking: InvoiceBooking }) {
  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="glass-card p-8 print:border-0 print:bg-white print:text-black print:shadow-none">
        <div className="flex items-start justify-between border-b border-white/10 pb-6 print:border-black/10">
          <div>
            <h2 className="font-display text-xl font-bold text-gradient-gold print:text-black">
              ARENA 51 GAMING LOUNGE
            </h2>
            <p className="mt-1 text-xs text-muted-foreground print:text-black/60">Tax Invoice / Receipt</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono text-gold-300 print:text-black">{booking.booking_reference}</p>
            <p className="text-xs text-muted-foreground print:text-black/60">
              {new Date(booking.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground print:text-black/60">
              Billed to
            </p>
            <p className="font-medium">{booking.customer_name}</p>
            <p className="text-muted-foreground print:text-black/70">{booking.customer_phone}</p>
            {booking.customer_email && <p className="text-muted-foreground print:text-black/70">{booking.customer_email}</p>}
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground print:text-black/60">
              Session
            </p>
            <p>{booking.booking_date}</p>
            <p className="text-muted-foreground print:text-black/70">
              {booking.start_time.slice(0, 5)} · {booking.duration_minutes} minutes
            </p>
          </div>
        </div>

        <table className="w-full border-collapse font-mono text-sm">
          <tbody>
            <Row label="Base amount" value={booking.base_amount} />
            {booking.surcharge_amount > 0 && <Row label="Surcharge" value={booking.surcharge_amount} />}
            {booking.discount_amount > 0 && <Row label="Discount" value={-booking.discount_amount} />}
            <Row label="Total" value={booking.total_amount} bold />
            <Row label="Advance paid" value={booking.advance_amount} />
            <Row label="Balance due at lounge" value={booking.balance_amount} />
          </tbody>
        </table>

        <p className="mt-8 text-center text-xs text-muted-foreground print:text-black/60">
          Payment status: {booking.payment_status.toUpperCase()} · Thank you for playing at Arena 51.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <tr className={bold ? 'border-t border-white/10 print:border-black/10' : ''}>
      <td className={`py-2 ${bold ? 'font-bold' : 'text-muted-foreground print:text-black/70'}`}>{label}</td>
      <td className={`py-2 text-right ${bold ? 'font-bold text-gold-300 print:text-black' : ''}`}>
        {formatCurrencyINR(value)}
      </td>
    </tr>
  );
}
