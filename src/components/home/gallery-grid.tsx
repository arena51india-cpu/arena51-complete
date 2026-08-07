import Image from 'next/image';

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string | null;
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return (
      <div className="glass-card p-10 text-center text-sm text-muted-foreground">
        Gallery photos are added by the Arena 51 team via the admin dashboard — check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img, i) => (
        <div
          key={img.id}
          className={`group relative overflow-hidden rounded-xl bg-muted ${
            i % 5 === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
          }`}
        >
          <Image
            src={img.image_url}
            alt={img.caption ?? 'Arena 51 Gaming Lounge'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {img.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-xs text-white">{img.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
