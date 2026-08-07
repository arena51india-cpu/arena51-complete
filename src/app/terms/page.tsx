import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/shared/section-heading';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container className="max-w-3xl">
          <h1 className="mb-2 font-display text-3xl font-bold text-gradient-gold">
            Terms &amp; Conditions
          </h1>
          <p className="mb-10 text-sm text-muted-foreground">Last updated: August 2026</p>

          <div className="space-y-8 text-sm text-muted-foreground [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
            <section>
              <h2>Bookings</h2>
              <p>
                A booking is confirmed once the advance payment is received. The remaining
                balance is due on arrival at the lounge. Bookings are held for 15 minutes past
                the scheduled start time before being released.
              </p>
            </section>
            <section>
              <h2>Station assignment</h2>
              <p>
                Arena 51 automatically assigns the best available gaming station based on your
                party size and time slot. Any preferred game you select is a preference only —
                availability of a specific title or console is not guaranteed.
              </p>
            </section>
            <section>
              <h2>Cancellations & rescheduling</h2>
              <p>
                Bookings can be rescheduled or cancelled from your dashboard up to 2 hours
                before the scheduled start time. Advance payments for cancellations made after
                this window are non-refundable.
              </p>
            </section>
            <section>
              <h2>Conduct</h2>
              <p>
                We reserve the right to end a session without refund in cases of damage to
                equipment, abusive behaviour toward staff or other players, or violation of
                lounge rules posted on-site.
              </p>
            </section>
            <section>
              <h2>Memberships & promo codes</h2>
              <p>
                Membership discounts and promo codes cannot be combined beyond what is
                explicitly stated at checkout. Membership benefits are non-transferable and
                apply only to the account holder.
              </p>
            </section>
            <section>
              <h2>Changes to these terms</h2>
              <p>
                We may update these terms from time to time. Continued use of our booking
                platform after changes are posted constitutes acceptance of the updated terms.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
