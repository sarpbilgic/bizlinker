'use client'

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function MapWithBusinessesWrapper({ location, filters }) {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    if (!location) return;
    const params = new URLSearchParams({
      lat: location.lat,
      lng: location.lng,
      radius: 30,
    });
    fetch(`/api/businesses?${params}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [location]);

  const center = location ? [location.lat, location.lng] : [0, 0];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {businesses.map((b, idx) => (
        b.coordinates ? (
          <Marker key={idx} position={[b.coordinates[1], b.coordinates[0]]}>
            <Popup>
              <strong>{b.name}</strong><br />
              <a href={b.website} target="_blank" rel="noreferrer">Site</a>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
