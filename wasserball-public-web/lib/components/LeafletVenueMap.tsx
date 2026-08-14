'use client';

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const venuePosition: [number, number] = [51.877462, 6.150263];

export default function LeafletVenueMap() {
  return (
    <MapContainer
      center={venuePosition}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={venuePosition}
        radius={10}
        pathOptions={{ color: '#ffffff', fillColor: '#d6221f', fillOpacity: 1, weight: 3 }}
      >
        <Popup>Haagsche Straße 2, 46446 Emmerich am Rhein</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
