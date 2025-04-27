import Link from 'next/link';
import RatingStars from '@components/RatingStars';

export default function BusinessCard({ business }) {
  return (
    <div className="bg-white rounded-md shadow p-4 hover:shadow-lg transition">
      <img
        src={business.imageUrl || '/placeholder.jpg'}
        alt={business.name}
        className="h-40 w-full object-cover rounded"
      />
      <div className="mt-4">
        <h3 className="text-xl font-semibold">{business.name}</h3>
        <div className="flex items-center mt-1">
          <RatingStars rating={business.rating || 0} />
          <span className="ml-2 text-gray-600">({business.reviewsCount || 0})</span>
        </div>
        <p className="text-gray-700 mt-2 truncate">{business.description}</p>
        <Link href={`/business/${business._id}`}>
          <a className="inline-block mt-4 text-blue-600 hover:underline">View Details</a>
        </Link>
      </div>
    </div>
    )
}