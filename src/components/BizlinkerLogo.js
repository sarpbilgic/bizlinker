import Link from 'next/link';

export default function BizlinkerLogo({ size = 'default' }) {
  const sizeClasses = {
    small: 'text-xl',
    default: 'text-2xl',
    large: 'text-3xl'
  };

  return (
    <Link href="/" className="flex items-center gap-2 select-none">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg transform rotate-45 flex items-center justify-center shadow-lg">
          <div className="w-4 h-4 bg-white rounded absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded-sm"></div>
          </div>
        </div>
      </div>
      <div className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent`}>
        <span className="text-orange-500">Biz</span>
        linker
      </div>
    </Link>
  );
} 