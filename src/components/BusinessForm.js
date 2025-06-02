"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

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


const defaultPosition = [41.0082, 28.9784]; // Istanbul as default

export default function BusinessForm() {
  const [form, setForm] = useState({
    name: "",
    category: "restaurant",
    services: [{ name: "", price: 0 }],
    coordinates: [defaultPosition[1], defaultPosition[0]], // [lng, lat]
  });

  const handleServiceChange = (index, field, value) => {
    const newServices = [...form.services];
    newServices[index][field] = field === "price" ? parseFloat(value) : value;
    setForm({ ...form, services: newServices });
  };

  const addService = () => {
    setForm({ ...form, services: [...form.services, { name: "", price: 0 }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch("/api/business/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        services: form.services,
        location: {
          type: "Point",
          coordinates: form.coordinates,
        },
      }),
    });

    const data = await res.json();
    alert("Business created!");
    console.log(data);
  };

  const DraggableMarker = () => {
    const [position, setPosition] = useState(defaultPosition);

    useMapEvents({
      dragend: () => {},
    });

    return (
      <Marker
        draggable
        position={position}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            setForm({ ...form, coordinates: [lng, lat] }); // Save [lng, lat]
            setPosition([lat, lng]);
          },
        }}
        icon={L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Register Your Business</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Business Name"
          className="w-full border p-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <select
          className="w-full border p-2"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="restaurant">Restaurant</option>
          <option value="market">Market</option>
          <option value="salon">Salon</option>
          <option value="cleaning">Cleaning</option>
          <option value="fitness">Fitness</option>
        </select>

        {form.services.map((service, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Service Name"
              className="flex-1 border p-2"
              value={service.name}
              onChange={(e) => handleServiceChange(i, "name", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Price"
              className="w-24 border p-2"
              value={service.price}
              onChange={(e) => handleServiceChange(i, "price", e.target.value)}
              required
            />
          </div>
        ))}

        <button
          type="button"
          className="bg-gray-200 px-3 py-1 rounded"
          onClick={addService}
        >
          + Add Service
        </button>

        <div className="h-64">
          <MapContainer center={defaultPosition} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <DraggableMarker />
          </MapContainer>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
