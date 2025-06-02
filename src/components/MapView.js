"use client";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapView({ center = [0, 0], markers = [] }) {
  return (
    <div className="h-64 w-full rounded-md overflow-hidden">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((m) => (
          <Marker key={m._id} position={[m.location.lat, m.location.lng]}> 
            <Popup>
              <a href={`/business/${m._id}`} className="text-blue-600 hover:underline">
                {m.name}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    )
}