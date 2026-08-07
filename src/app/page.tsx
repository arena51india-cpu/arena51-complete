import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { GameCard } from '@/components/home/game-card';
import { PricingCard } from '@/components/home/pricing-card';
import { MembershipCard } from '@/components/home/membership-card';
import { OfferCard } from '@/components/home/offer-card';
import { GalleryGrid } from '@/components/home/gallery-grid';
import { ReviewsSection } from '@/components/home/reviews-section';
import { FaqAccordion } from '@/components/home/faq-accordion';
import { ContactForm } from '@/components/home/contact-form';
import { ContactInfoPanel } from '@/components/home/contact-info-panel';
import { InstagramFeed } from '@/components/home/instagram-feed';
import { Button } from '@/components/ui/button';
import {
  getFeaturedGames,
  getPricingPlans,
  getMemberships,
  getActiveOffers,
  getGalleryImages,
  getPublishedReviews,
  getFaqs,
  getCmsSetting,
} from '@/lib/data/public';

export const revalidate = 60;

export default async function Home() {
  const [heroContent, offers, featuredGames, pricingPlans, memberships, gallery, reviews, faqs, contactInfo, businessHours] =
    await Promise.all([
      getCmsSetting<{ heading?: string; subheading?: string; cta_text?: string }>('homepage_hero'),
      getActiveOffers(),
      getFeaturedGames(),
      getPricingPlans(),
      getMemberships(),
      getGalleryImages(),
      getPublishedReviews(),
      getFaqs(),
      getCmsSetting<{ address?: string; phone?: string; email?: string; google_maps_embed_url?: string }>('contact_info'),
      getCmsSetting<Record<string, string>>('business_hours'),
    ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero content={heroContent} />

        {offers.length > 0 && (
          <section className="pb-20">
            <Container>
              <SectionHeading eyebrow="This week" title="Current Offers" align="left" className="mx-0" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {offers.slice(0, 3).map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {memberships.length > 0 && (
          <section className="py-20">
            <Container>
              <SectionHeading
                eyebrow="Members save more"
                title="Membership Plans"
                description="Silver, Gold, and Platinum memberships unlock discounts, free hours, and birthday perks on every visit."
              />
              <div className="grid gap-6 md:grid-cols-3">
                {memberships.map((m) => (
                  <MembershipCard key={m.id} membership={m} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {pricingPlans.length > 0 && (
          <section className="py-20">
            <Container>
              <SectionHeading
                eyebrow="Simple, transparent"
                title="Pricing"
                description="Pay by the hour, no hidden fees. Every plan auto-assigns the best available station."
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pricingPlans.slice(0, 3).map((plan, i) => (
                  <PricingCard key={plan.id} plan={plan} highlighted={i === 1} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button asChild variant="outline">
                  <Link href="/pricing">
                    View full pricing <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Container>
          </section>
        )}

        {featuredGames.length > 0 && (
          <section className="py-20">
            <Container>
              <SectionHeading
                eyebrow="Game library"
                title="Play Something New"
                description="From competitive shooters to single-player epics — every station supports the full library."
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button asChild variant="outline">
                  <Link href="/games">
                    Browse full library <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Container>
          </section>
        )}

        <section className="py-20">
          <Container>
            <SectionHeading eyebrow="Player stories" title="What Players Say" />
            <ReviewsSection reviews={reviews as any} />
          </Container>
        </section>

        <section className="py-20">
          <Container>
            <SectionHeading eyebrow="Inside the lounge" title="Gallery" />
            <GalleryGrid images={gallery} />
          </Container>
        </section>

        <section className="py-20">
          <Container className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Follow along" title="On Instagram" align="left" className="mx-0" />
              <InstagramFeed />
            </div>
            <div>
              <SectionHeading eyebrow="Questions" title="FAQs" align="left" className="mx-0" />
              <FaqAccordion faqs={faqs as any} />
            </div>
          </Container>
        </section>

        <section className="py-20">
          <Container>
            <SectionHeading eyebrow="Get in touch" title="Contact Us" />
            <div className="grid gap-8 lg:grid-cols-2">
              <ContactForm />
              <ContactInfoPanel contact={contactInfo} hours={businessHours} />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
