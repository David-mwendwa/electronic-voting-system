import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className='mt-8 border-t border-gray-200 bg-white/80 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-500 gap-2'>
        <div className='flex items-center gap-1 text-center sm:text-left'>
          <span className='font-semibold text-gray-700'>EVS</span>
          <span className='hidden sm:inline'>&mdash;</span>
          <span>Electronic Voting System</span>
        </div>
        <div className='flex items-center gap-4 flex-wrap justify-center sm:justify-end'>
          <span className='text-gray-400'>© {year}</span>
          <span className='text-gray-400 hidden sm:inline'>
            Developed by{' '}
            <a
              href='https://techdave.netlify.app/'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-gray-600 hover:text-primary-600 transition-colors duration-150'>
              David
            </a>
          </span>
          <a
            href='https://evspolls.netlify.app'
            target='_blank'
            rel='noreferrer'
            className='hover:text-primary-600 transition-colors duration-150'>
            Live App
          </a>
          <a
            href='https://electronic-voting-system-nxqt.onrender.com/api/health'
            target='_blank'
            rel='noreferrer'
            className='hover:text-primary-600 transition-colors duration-150'>
            API Status
          </a>
          <a
            href='https://github.com/David-mwendwa/electronic-voting-system'
            target='_blank'
            rel='noreferrer'
            className='hover:text-primary-600 transition-colors duration-150'>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
