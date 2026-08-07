import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { PricingCard } from '@/components/home/pricing-card';
import { getPricingPlans } from '@/lib/data/public';

export const revalidate = 60;

export default async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple, Transparent Pricing"
            description="Pay by the hour with 30-minute extensions. Weekend and festival pricing may apply — shown at checkout before you pay."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <PricingCard key={plan.id} plan={plan} highlighted={i === 1} />
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl glass-card p-6 text-sm text-muted-foreground">
            <h3 className="mb-2 font-display font-semibold text-foreground">How pricing works</h3>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Choose a setup based on how many players are in your group.</li>
              <li>Pick a duration from 30 minutes up to 4 hours.</li>
              <li>Weekend and festival dates may carry a surcharge, clearly shown before payment.</li>
              <li>Members get an automatic discount on top of the listed price.</li>
              <li>A 30% advance secures your slot — the balance is paid on arrival.</li>
            </ul>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
