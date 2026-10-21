import { useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PropertyListing } from '../types/rental';
import {
  buildMarkerTitle,
  buildPopupHtml,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_TILE_ATTRIBUTION,
  DEFAULT_MAP_TILE_URL,
  escapeHtml,
  formatMonthlyRent,
  getMappableHomes
} from '../lib/rentalMap';

interface RentalMapProps {
  homes: PropertyListing[];
  selectedHomeId: string | null;
  onSelectHome: (homeId: string | null) => void;
}

const DEFAULT_CENTER: L.LatLngExpression = [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

function tileUrl(): string {
  const configured = import.meta.env?.VITE_MAP_TILE_URL?.trim();
  return configured || DEFAULT_MAP_TILE_URL;
}

function tileAttribution(): string {
  const configured = import.meta.env?.VITE_MAP_TILE_ATTRIBUTION?.trim();
  return configured || DEFAULT_MAP_TILE_ATTRIBUTION;
}

function priceIcon(home: PropertyListing, selected: boolean): L.DivIcon {
  const label = escapeHtml(formatMonthlyRent(home.monthlyRent));
  const background = selected ? '#0b763c' : '#168241';
  const border = selected ? '#0b763c' : '#ffffff';
  const ring = selected ? 'box-shadow:0 0 0 4px rgba(11,118,60,0.3);' : 'box-shadow:0 1px 4px rgba(0,0,0,0.35);';
  const html = `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;border-radius:9999px;border:2px solid ${border};background:${background};${ring}color:#ffffff;font-size:12px;font-weight:700;line-height:1;padding:6px 10px;">${label}</span>`;
  return L.divIcon({
    html,
    className: 'rental-map-price-marker',
    iconSize: [72, 26],
    iconAnchor: [36, 13]
  });
}

export function RentalMap({ homes, selectedHomeId, onSelectHome }: RentalMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new globalThis.Map());
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectHomeRef = useRef(onSelectHome);
  const selectedHomeIdRef = useRef(selectedHomeId);
  onSelectHomeRef.current = onSelectHome;
  selectedHomeIdRef.current = selectedHomeId;

  const mappableHomes = useMemo(() => getMappableHomes(homes), [homes]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true
    });

    L.tileLayer(tileUrl(), {
      attribution: tileAttribution(),
      maxZoom: 19
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Markers are keyed by home id and reused across renders. Recreating them on every
  // selection change would close the popup that the click just opened.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const activeIds = new Set(mappableHomes.map((home) => home.id));

    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    mappableHomes.forEach((home) => {
      if (markersRef.current.has(home.id)) return;

      const marker = L.marker([home.coordinates.lat, home.coordinates.lng], {
        icon: priceIcon(home, home.id === selectedHomeIdRef.current),
        title: buildMarkerTitle(home),
        riseOnHover: true
      });
      marker.bindPopup(buildPopupHtml(home));
      marker.on('click', () => onSelectHomeRef.current(home.id));
      marker.addTo(layer);
      markersRef.current.set(home.id, marker);
    });
  }, [mappableHomes]);

  // Restyle the selected pin in place so an open popup is not dismissed.
  useEffect(() => {
    mappableHomes.forEach((home) => {
      const marker = markersRef.current.get(home.id);
      if (!marker) return;
      const position = marker.getLatLng();
      if (position.lat !== home.coordinates.lat || position.lng !== home.coordinates.lng) {
        marker.setLatLng([home.coordinates.lat, home.coordinates.lng]);
      }
      marker.setIcon(priceIcon(home, home.id === selectedHomeId));
    });
  }, [mappableHomes, selectedHomeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mappableHomes.length === 0) return;

    if (mappableHomes.length === 1) {
      map.setView([mappableHomes[0].coordinates.lat, mappableHomes[0].coordinates.lng], 13);
      return;
    }

    const bounds = L.latLngBounds(
      mappableHomes.map((home) => [home.coordinates.lat, home.coordinates.lng] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
  }, [mappableHomes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedHomeId) return;
    const marker = markersRef.current.get(selectedHomeId);
    if (!marker) return;
    const position = marker.getLatLng();
    if (map.getBounds().contains(position)) return;
    map.panTo(position);
  }, [selectedHomeId, mappableHomes]);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-[#edf1ea] lg:min-h-[560px]">
      <div ref={containerRef} className="h-full w-full" aria-label="Map of available homes" role="application" />
      <span className="pointer-events-none absolute right-3 top-3 z-[500] bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-[#333] shadow">
        {mappableHomes.length} homes on map
      </span>
    </div>
  );
}
