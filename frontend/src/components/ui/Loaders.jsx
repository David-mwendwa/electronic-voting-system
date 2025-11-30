export const TableSkeleton = () => (
  <div className='space-y-4'>
    <div className='animate-pulse space-y-4'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='h-16 bg-gray-200 rounded-md'></div>
      ))}
    </div>
  </div>
);

export const Spinner = () => (
  <div className='flex items-center justify-center py-16'>
    <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600'></div>
  </div>
);
