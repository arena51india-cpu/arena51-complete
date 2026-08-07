import Image from 'next/image';
import { AdminPageHeader } from '@/components/admin/page-header';
import { GalleryUploadDialog } from '@/components/admin/gallery-upload-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { getAllGalleryImagesAdmin } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const images = await getAllGalleryImagesAdmin();

  return (
    <div>
      <AdminPageHeader title="Gallery" description="Upload and manage lounge photos." action={<GalleryUploadDialog />} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img: any) => (
          <div key={img.id} className="glass-card overflow-hidden p-0">
            <div className="relative aspect-square w-full bg-muted">
              <Image src={img.image_url} alt={img.caption ?? ''} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between p-3">
              <InlineToggle table="gallery_images" id={img.id} field="is_active" initialValue={img.is_active} />
              <DeleteRowButton table="gallery_images" id={img.id} label="this photo" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
