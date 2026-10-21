import { PropertyListing } from '../types/rental';

export const DEFAULT_MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const DEFAULT_MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const DEFAULT_MAP_CENTER = { lat: 33.748995, lng: -84.387982 };

/** Escapes listing text before it is injected into a Leaflet popup as HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Keeps only listings that have usable coordinates so the map never plots NaN. */
export function getMappableHomes(homes: PropertyListing[]): PropertyListing[] {
  return homes.filter(
    (home) =>
      Number.isFinite(home.coordinates?.lat) &&
      Number.isFinite(home.coordinates?.lng) &&
      Math.abs(home.coordinates.lat) <= 90 &&
      Math.abs(home.coordinates.lng) <= 180
  );
}

/** Formats the monthly rent used by the price pin and the popup. */
export function formatMonthlyRent(monthlyRent: number): string {
  return `$${monthlyRent.toLocaleString()}`;
}

/** Builds the popup body for a listing. All listing text is escaped. */
export function buildPopupHtml(home: PropertyListing): string {
  return `<div class="max-w-56 p-1 text-[#231f20]">
          <p class="font-semibold">${escapeHtml(home.address)}</p>
          <p class="mt-1 text-xs">${escapeHtml(home.city)}, ${escapeHtml(home.state)}</p>
          <p class="mt-1 text-sm font-bold text-[#168241]">${formatMonthlyRent(home.monthlyRent)}/mo</p>
          <a href="/houses-for-rent/${encodeURIComponent(home.id)}" class="mt-2 inline-block text-xs font-semibold text-[#168241] underline">View home</a>
        </div>`;
}

/** Builds the marker tooltip text. */
export function buildMarkerTitle(home: PropertyListing): string {
  return `${home.address}, ${home.city}: ${formatMonthlyRent(home.monthlyRent)} per month`;
}
