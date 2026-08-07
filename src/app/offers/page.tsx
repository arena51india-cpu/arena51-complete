import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { OfferCard } from '@/components/home/offer-card';
import { getActiveOffers } from '@/lib/data/public';

export const revalidate = 60;

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container>
          <SectionHeading
            eyebrow="Don't miss out"
            title="Current Offers"
            description="Festival specials, weekend deals, flash sales, and combo offers — updated regularly."
          />
          {offers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No active offers right now — check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
