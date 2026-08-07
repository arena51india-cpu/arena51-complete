import type { GamingStation, Game } from '@/lib/types/database.types';

export interface ExistingBookingWindow {
  stationId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface StationAssignmentInput {
  /** All stations currently configured by the admin — fetched fresh, never hardcoded. */
  stations: GamingStation[];
  /** Bookings/sessions already occupying stations for the requested date. */
  existingBookings: ExistingBookingWindow[];
  players: number;
  requestedStart: Date;
  requestedEnd: Date;
  preferredGame?: Game | null;
}

export interface StationAssignmentResult {
  stationId: string | null;
  station: GamingStation | null;
  reason: string;
}

function windowsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Selects the best available gaming station for a booking window.
 *
 * Selection order (this is the entire "smart" part of smart booking):
 *   1. Must be active (not disabled) and not under maintenance/offline.
 *   2. Must support the requested player count (max_players >= players).
 *   3. Must be free for the entire requested time window (no overlap
 *      with any existing booking/session on that station).
 *   4. If a preferred game is set and it lists compatible device types,
 *      prefer stations whose device_type matches — but this is only a
 *      preference, never a hard requirement (per the "Preferred Game is
 *      optional" rule), so we fall back to any free station of the right
 *      capacity if no matching-device station is free.
 *   5. Among remaining candidates, prefer the tightest fit (smallest
 *      max_players that still satisfies the party size) so larger
 *      multi-seat stations stay free for bigger groups later in the day.
 *   6. Ties broken by sort_order / station_number for deterministic,
 *      predictable assignment.
 *
 * New stations added by the admin (PS5 #3, a new PC, a VR booth, etc.)
 * are automatically included because this function always operates on
 * whatever `stations` array is passed in from the database — nothing
 * here references a specific station by name or id.
 */
export function assignBestStation(input: StationAssignmentInput): StationAssignmentResult {
  const { stations, existingBookings, players, requestedStart, requestedEnd, preferredGame } = input;

  const eligible = stations.filter(
    (s) => s.is_active && s.status !== 'maintenance' && s.status !== 'offline' && s.max_players >= players
  );

  if (eligible.length === 0) {
    return { stationId: null, station: null, reason: 'No active stations support this party size.' };
  }

  const free = eligible.filter((station) => {
    const conflicts = existingBookings.some(
      (b) =>
        b.stationId === station.id &&
        windowsOverlap(requestedStart, requestedEnd, b.startsAt, b.endsAt)
    );
    return !conflicts;
  });

  if (free.length === 0) {
    return { stationId: null, station: null, reason: 'All suitable stations are booked for this time slot.' };
  }

  const preferredDeviceTypes = preferredGame?.compatible_device_types ?? [];
  const matchingPreference =
    preferredDeviceTypes.length > 0
      ? free.filter((s) => preferredDeviceTypes.includes(s.device_type))
      : [];

  const pool = matchingPreference.length > 0 ? matchingPreference : free;

  const best = [...pool].sort((a, b) => {
    if (a.max_players !== b.max_players) return a.max_players - b.max_players; // tightest fit first
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.station_number - b.station_number;
  })[0];

  const reason =
    matchingPreference.length > 0
      ? `Assigned based on availability and preferred game compatibility.`
      : `Assigned based on availability (preferred game's usual station type was unavailable).`;

  return { stationId: best.id, station: best, reason };
}
