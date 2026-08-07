import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { GalleryGrid } from '@/components/home/gallery-grid';
import { getGalleryImages } from '@/lib/data/public';

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container>
          <SectionHeading
            eyebrow="Inside the lounge"
            title="Gallery"
            description="A look at our stations, setups, and the energy on game night."
          />
          <GalleryGrid images={images} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
