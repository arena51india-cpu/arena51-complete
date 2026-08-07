import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/shared/section-heading';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container className="max-w-3xl">
          <h1 className="mb-2 font-display text-3xl font-bold text-gradient-gold">Privacy Policy</h1>
          <p className="mb-10 text-sm text-muted-foreground">Last updated: August 2026</p>

          <div className="space-y-8 text-sm text-muted-foreground [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
            <section>
              <h2>Information we collect</h2>
              <p>
                When you book a session, create an account, or contact us, we collect your
                name, phone number, email address, and — if provided — your birthday. We also
                record your booking history, session duration, favourite games, and loyalty
                point balance to run our membership and rewards program.
              </p>
            </section>
            <section>
              <h2>Payment information</h2>
              <p>
                Payments are processed by Razorpay. We do not store your card, UPI, or bank
                details on our servers — Razorpay handles that data under its own security and
                compliance standards.
              </p>
            </section>
            <section>
              <h2>How we use your information</h2>
              <p>
                We use your information to confirm bookings, send booking and payment
                confirmations by email, manage your membership and loyalty points, and improve
                our service. We do not sell your personal information to third parties.
              </p>
            </section>
            <section>
              <h2>Communications</h2>
              <p>
                We may send you booking confirmations, receipts, and occasional offers by
                email or WhatsApp. You can opt out of marketing messages at any time.
              </p>
            </section>
            <section>
              <h2>Data retention & access</h2>
              <p>
                We retain booking and transaction records as required for accounting and legal
                purposes. You may request a copy of your data or ask us to delete your account
                by contacting us through the Contact page.
              </p>
            </section>
            <section>
              <h2>Security</h2>
              <p>
                We use role-based access controls, audit logging, and industry-standard
                encryption in transit to protect your data. Access to customer records is
                restricted to authorized Arena 51 staff.
              </p>
            </section>
            <section>
              <h2>Contact</h2>
              <p>
                Questions about this policy? Reach out via our Contact page and we'll respond
                as soon as possible.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
