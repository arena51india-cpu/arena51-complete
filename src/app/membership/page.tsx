import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { MembershipCard } from '@/components/home/membership-card';
import { getMemberships } from '@/lib/data/public';

export const revalidate = 60;

export default async function MembershipPage() {
  const memberships = await getMemberships();

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container>
          <SectionHeading
            eyebrow="Membership"
            title="Play More, Spend Less"
            description="Silver, Gold, and Platinum memberships unlock discounts, free hours, priority booking, and birthday perks."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {memberships.map((m) => (
              <MembershipCard key={m.id} membership={m} />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
