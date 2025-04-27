// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import SearchBar from "@components/SearchBar";
import FilterSidebar from "@components/FilterSideBar";
import BusinessCard from "@components/BusinessCard";
import MapView from "@components/MapView";

export default function HomePage() {
  const [searchParams, setSearchParams] = useState({ query: "", location: "" });
  const [filters, setFilters]         = useState({ categories: [], minRating: 0, maxPrice: 1000 });
  const [businesses, setBusinesses]   = useState([]);
  const [mapCenter, setMapCenter]     = useState([0, 0]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/business/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...searchParams, ...filters }),
        });
        const { businesses = [] } = await res.json();
        setBusinesses(businesses);
        if (businesses.length) {
          const { lat, lng } = businesses[0].location;
          setMapCenter([lat, lng]);
        }
      } catch (e) {
        console.error("Error fetching businesses:", e);
      }
    })();
  }, [searchParams, filters]);

  return (
    <div className="space-y-6">
      <SearchBar   onSearch={setSearchParams} />
      <div className="flex flex-col lg:flex-row">
        <FilterSidebar
          categories={["Food", "Beauty", "Health", "Events", "Services"]}
          onFilter={setFilters}
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {businesses.map((b) => (
            <BusinessCard key={b._id} business={b} />
          ))}
        </div>
      </div>
      <MapView center={mapCenter} markers={businesses} />
    </div>
  );
}
