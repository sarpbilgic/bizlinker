'use client';

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export default function MapWithBusinesses({ location, filters }) {
  const [businesses, setBusinesses] = useState([]);
  const [mapCenter, setMapCenter] = useState([35.1299, 33.9461]); // Gazimağusa 

  useEffect(() => {
    if (location) {
      setMapCenter([location.lat, location.lng]);
    }

    const fetchBusinesses = async () => {
      const res = await fetch('/api/business/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: filters.category,
          priceRange: filters.priceRange,
          userLocation: location || { lat: 35.1299, lng: 33.9461 },
        }),
      });

      const data = await res.json();
      setBusinesses(data);
    };

    fetchBusinesses();
  }, [location, filters]);

  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden shadow-lg">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {businesses.map((biz) => (
          <Marker
            key={biz._id}
            position={[biz.location.coordinates[1], biz.location.coordinates[0]]}
          >
            <Popup>
              <div className="text-sm text-[#0f0f0f]">
                <p className="font-semibold text-[#ff3c3c]">{biz.name}</p>
                <p className="text-[12px]">{biz.category}</p>
                <p className="text-[12px] italic text-[#a0522d]">
                  {biz.description?.slice(0, 60)}...
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
