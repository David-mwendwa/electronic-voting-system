import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Select an Election',
      description:
        'Browse through the list of active elections and select the one you want to participate in.',
      icon: (
        <svg
          className='w-8 h-8 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Verify Your Identity',
      description:
        'Enter your voter ID and verify your identity to ensure a secure voting process.',
      icon: (
        <svg
          className='w-8 h-8 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Cast Your Vote',
      description:
        'Select your preferred candidate and submit your vote. You can review your selection before final submission.',
      icon: (
        <svg
          className='w-8 h-8 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M5 13l4 4L19 7'
          />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Get Confirmation',
      description:
        'Receive immediate confirmation that your vote has been successfully recorded in the system.',
      icon: (
        <svg
          className='w-8 h-8 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M5 13l4 4L19 7'
          />
        </svg>
      ),
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <div className='bg-white'>
        <div className='py-16 md:py-20 lg:py-24'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              <span className='block'>How It Works</span>
              <span className='text-primary-600'>Voting Made Simple</span>
            </h1>
            <p className='mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
              Our secure online voting system makes it easy for you to
              participate in elections from anywhere, at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className='py-12 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='lg:text-center'>
            <h2 className='text-base text-primary-600 font-semibold tracking-wide uppercase'>
              Process
            </h2>
            <p className='mt-2 text-3xl leading-8 font-semibold tracking-tight text-gray-900 sm:text-4xl'>
              Simple Steps to Cast Your Vote
            </p>
          </div>

          <div className='mt-10'>
            <div className='space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10'>
              {steps.map((step, index) => (
                <div key={step.number} className='relative'>
                  <div className='flex items-center'>
                    <div className='flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white'>
                      {step.icon}
                    </div>
                    <div className='ml-4'>
                      <h3 className='text-lg leading-6 font-medium text-gray-900'>
                        <span className='text-primary-600'>{step.number}.</span>{' '}
                        {step.title}
                      </h3>
                      <p className='mt-2 text-base text-gray-500'>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Voting Link */}
      <div className='bg-gray-50 py-6 border-t border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-center'>
            <Link
              to='/'
              className='inline-flex items-center text-primary-700 hover:text-primary-800 font-medium transition-all duration-300 transform hover:translate-x-1 group'>
              <div className='relative'>
                <div className='absolute h-8 w-8 -left-1.5 -top-1.5 rounded-full bg-primary-100 opacity-75 animate-ping'></div>
                <svg
                  className='h-5 w-5 mr-2 text-primary-600 relative z-10 animate-pulse'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
              </div>
              <span className='border-b-2 border-transparent hover:border-primary-600 transition-colors duration-200'>
                Back to Voting
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
