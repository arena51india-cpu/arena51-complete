import type { GamingStation } from '@/lib/types/database.types';
import { generateTimeSlots } from './constants';
import { assignBestStation, type ExistingBookingWindow } from './stationAssignment';

export interface SlotAvailability {
  time: string; // HH:MM
  available: boolean;
  freeStations: number;
  totalEligibleStations: number;
}

/**
 * Only `confirmed`/`in_progress` bookings occupy a station — a booking
 * that hasn't had any payment yet (`pending_payment`, advance ₹0) does
 * not block a slot for anyone else. Callers should query bookings with
 * that status filter before building `existingBookings`.
 */
export function computeSlotAvailability(params: {
  stations: GamingStation[];
  existingBookings: ExistingBookingWindow[];
  bookingDate: string; // YYYY-MM-DD
  durationMinutes: number;
  players: number;
}): SlotAvailability[] {
  const { stations, existingBookings, bookingDate, durationMinutes, players } = params;

  const eligibleStations = stations.filter((s) => s.is_active && s.max_players >= players);
  const slots = generateTimeSlots();
  const now = new Date();

  return slots.map((time) => {
    const start = new Date(`${bookingDate}T${time}`);
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    // Past slots today are never bookable.
    if (start < now) {
      return { time, available: false, freeStations: 0, totalEligibleStations: eligibleStations.length };
    }

    const result = assignBestStation({
      stations: eligibleStations,
      existingBookings,
      players,
      requestedStart: start,
      requestedEnd: end,
    });

    const freeStations = eligibleStations.filter((station) => {
      const conflict = existingBookings.some(
        (b) => b.stationId === station.id && start < b.endsAt && b.startsAt < end
      );
      return !conflict;
    }).length;

    return {
      time,
      available: !!result.stationId,
      freeStations,
      totalEligibleStations: eligibleStations.length,
    };
  });
}
