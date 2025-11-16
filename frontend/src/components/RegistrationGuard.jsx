import { useSettings } from '../context/SettingsContext';

const RegistrationGuard = ({ children }) => {
  const { registrationEnabled } = useSettings();

  if (!registrationEnabled) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8 text-center'>
          <div className='bg-white p-8 rounded-lg shadow-md'>
            <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100'>
              <svg
                className='h-10 w-10 text-red-500'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              Registration Disabled
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              New user registration is currently disabled by the system
              administrator. Please check back later or contact support if you
              believe this is an error.
            </p>
            <div className='mt-6'>
              <button
                onClick={() => window.history.back()}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RegistrationGuard;
