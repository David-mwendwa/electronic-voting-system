import { useNavigate } from 'react-router-dom';

const MaintenanceMessage = () => {
  const navigate = useNavigate();

  // Allow access to admin and login pages during maintenance
  const isAllowedPath = ['/admin', '/login'].some((path) =>
    window.location.pathname.startsWith(path)
  );

  if (isAllowedPath) {
    return null; // Don't show maintenance message on allowed paths
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100'>
            <svg
              className='h-10 w-10 text-yellow-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Under Maintenance
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            We&apos;re currently performing scheduled maintenance. We&apos;ll be
            back online shortly.
          </p>
          <div className='mt-6'>
            <p className='text-sm text-gray-500'>Estimated time: 30 minutes</p>
          </div>
          <div className='mt-6'>
            <button
              onClick={() => navigate('/')}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMessage;
