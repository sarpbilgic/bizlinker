export default function RatingStars({ rating = 0 }) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
    return (
      <div className="flex"> 
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.278 3.924a1 1 0 00.95.69h4.127c.969 0 1.371 1.24.588 1.81l-3.34 2.427a1 1 0 00-.364 1.118l1.278 3.924c.3.921-.755 1.688-1.538 1.118l-3.34-2.427a1 1 0 00-1.176 0l-3.34 2.427c-.783.57-1.838-.197-1.538-1.118l1.278-3.924a1 1 0 00-.364-1.118L2.098 9.35c-.783-.57-.38-1.81.588-1.81h4.127a1 1 0 00.95-.69l1.278-3.924z" />
          </svg>
        ))}
        {halfStar && (
          <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.278 3.924a1 1 0 00.95.69h4.127c.969 0 1.371 1.24.588 1.81l-3.34 2.427a1 1 0 00-.364 1.118l1.278 3.924c.3.921-.755 1.688-1.538 1.118l-3.34-2.427a1 1 0 00-1.176 0V2.927z" />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.278 3.924a1 1 0 00.95.69h4.127c.969 0 1.371 1.24.588 1.81l-3.34 2.427a1 1 0 00-.364 1.118l1.278 3.924c.3.921-.755 1.688-1.538 1.118l-3.34-2.427a1 1 0 00-1.176 0l-3.34 2.427c-.783.57-1.838-.197-1.538-1.118l1.278-3.924a1 1 0 00-.364-1.118L2.098 9.35c-.783-.57-.38-1.81.588-1.81h4.127a1 1 0 00.95-.69l1.278-3.924z" />
          </svg>
        ))}
      </div>
    );
  }