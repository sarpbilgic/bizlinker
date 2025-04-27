import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, location });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 bg-white rounded-md shadow">
      <input
        type="text"
        placeholder="Search services, events..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-48 p-2 border border-gray-300 rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}