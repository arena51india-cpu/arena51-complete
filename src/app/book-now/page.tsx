import Script from 'next/script';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { getPricingPlans, getGames } from '@/lib/data/public';

export const revalidate = 0;

export default async function BookNowPage() {
  const [plans, games] = await Promise.all([getPricingPlans(), getGames()]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Navbar />
      <main className="pt-40 pb-24">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Reserve your slot"
            title="Book Now"
            description="Players, date, time, duration — that's it. We'll assign the best available station automatically."
          />
          <BookingWizard plans={plans} games={games} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
