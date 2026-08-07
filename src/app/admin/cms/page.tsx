import { AdminPageHeader } from '@/components/admin/page-header';
import {
  HeroSettingsForm,
  ContactSettingsForm,
  BusinessHoursForm,
  LogoSettingsForm,
  SeoSettingsForm,
  FooterSettingsForm,
} from '@/components/admin/cms-settings-forms';
import { getAllCmsSettingsAdmin } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminCmsPage() {
  const settings = await getAllCmsSettingsAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Website CMS"
        description="Edit homepage content, contact info, business hours, branding, and SEO — no code required."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <HeroSettingsForm initial={settings.homepage_hero} />
        <ContactSettingsForm initial={settings.contact_info} />
        <BusinessHoursForm initial={settings.business_hours} />
        <LogoSettingsForm initial={settings.logo} />
        <SeoSettingsForm initial={settings.seo_meta} />
        <FooterSettingsForm initial={settings.footer} />
      </div>
    </div>
  );
}
