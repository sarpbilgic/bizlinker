export async function generateMetadata({ params }) {
  return { 
    title: `${decodeURIComponent(params.slug)} | Price Comparison`,
    description: `Compare prices for ${decodeURIComponent(params.slug)} across multiple stores in North Cyprus.`,
    openGraph: {
      title: `${decodeURIComponent(params.slug)} | Price Comparison`,
      description: `Compare prices for ${decodeURIComponent(params.slug)} across multiple stores in North Cyprus.`,
      type: 'website'
    }
  };
}

export default function GroupLayout({ children }) {
  return children;
} 