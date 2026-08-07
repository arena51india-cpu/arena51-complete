/**
 * Lounge operating window used to generate bookable time slots.
 * TODO: source this from the `business_hours` CMS setting per day once
 * the admin CMS form's format is normalized to 24h start/end times —
 * for now it's a single fixed window matching the seeded business hours.
 */
export const OPENING_TIME = '12:00';
export const CLOSING_TIME = '23:30';
export const SLOT_INTERVAL_MINUTES = 30;

/** Generates every bookable slot start time between opening and closing, in HH:MM. */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const [openH, openM] = OPENING_TIME.split(':').map(Number);
  const [closeH, closeM] = CLOSING_TIME.split(':').map(Number);

  let minutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  while (minutes <= closeMinutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    minutes += SLOT_INTERVAL_MINUTES;
  }

  return slots;
}
