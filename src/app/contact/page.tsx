import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { ContactForm } from '@/components/home/contact-form';
import { ContactInfoPanel } from '@/components/home/contact-info-panel';
import { getCmsSetting } from '@/lib/data/public';

export const revalidate = 60;

export default async function ContactPage() {
  const [contactInfo, businessHours] = await Promise.all([
    getCmsSetting<{ address?: string; phone?: string; email?: string; google_maps_embed_url?: string }>(
      'contact_info'
    ),
    getCmsSetting<Record<string, string>>('business_hours'),
  ]);

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container>
          <SectionHeading
            eyebrow="We're here to help"
            title="Get in Touch"
            description="Questions about bookings, memberships, or group events? Send us a message or drop by."
          />
          <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
            <ContactForm />
            <ContactInfoPanel contact={contactInfo} hours={businessHours} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
