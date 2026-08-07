import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface ContactInfo {
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  google_maps_embed_url?: string;
}

interface BusinessHours {
  [day: string]: string;
}

export function ContactInfoPanel({
  contact,
  hours,
}: {
  contact: ContactInfo | null;
  hours: BusinessHours | null;
}) {
  const rows = [
    { icon: MapPin, label: contact?.address || 'Address to be added via admin dashboard' },
    { icon: Phone, label: contact?.phone || 'Phone to be added via admin dashboard' },
    { icon: Mail, label: contact?.email || 'Email to be added via admin dashboard' },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card space-y-4 p-6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3 text-sm">
            <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
            <span className="text-muted-foreground">{row.label}</span>
          </div>
        ))}
        {hours && (
          <div className="flex items-start gap-3 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
            <div className="text-muted-foreground">
              {Object.entries(hours).map(([day, time]) => (
                <div key={day} className="flex justify-between gap-6">
                  <span className="capitalize">{day}</span>
                  <span className="font-mono">{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card aspect-video overflow-hidden p-0">
        {contact?.google_maps_embed_url ? (
          <iframe
            src={contact.google_maps_embed_url}
            className="h-full w-full border-0"
            loading="lazy"
            title="Arena 51 Gaming Lounge location"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Map embed will appear here once added via the admin dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
