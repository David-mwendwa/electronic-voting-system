import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiHome,
  FiPlusCircle,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiCheckCircle,
  FiChevronDown,
} from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Track scroll position for navbar style
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Mock authentication state - replace with your actual auth logic
  const isAuthenticated = true; // Set based on your auth state
  const user = { name: 'Admin User' }; // Replace with actual user data
  const isAdminPage = location.pathname === '/admin';

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome className='mr-2' /> },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-white/95 backdrop-blur-sm py-3'
      }`}>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-6'>
        <div className='flex justify-between items-center h-14 sm:h-16'>
          {/* Logo */}
          <div className='flex-shrink-0 flex items-center'>
            <Link to='/' className='flex items-center group'>
              <div className='relative h-8 w-8 md:h-9 md:w-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105 overflow-hidden border border-primary-400/20'>
                <div className='absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/10 transform rotate-12 group-hover:scale-150 transition-all duration-500'></div>
                <span className='text-white font-bold text-sm md:text-base tracking-tight relative z-10'>
                  EVS
                </span>
              </div>
              <span className='ml-3'>
                <span className='block text-[9px] md:text-[10px] font-medium text-gray-500 -mb-0.5 tracking-wider uppercase'>
                  E-Voting
                </span>
                <span className='text-sm md:text-base font-semibold text-gray-800 tracking-tight'>
                  SecureVote
                </span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500'
              aria-expanded='false'>
              <span className='sr-only'>Open main menu</span>
              {isOpen ? (
                <FiX className='block h-6 w-6' aria-hidden='true' />
              ) : (
                <FiMenu className='block h-6 w-6' aria-hidden='true' />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:ml-6 md:flex md:items-center md:space-x-2 lg:space-x-4'>
            {/* Home Link */}
            <Link
              to='/'
              className={`${
                location.pathname === '/'
                  ? 'text-primary-600 font-medium'
                  : 'text-gray-600 hover:text-primary-600'
              } inline-flex items-center text-sm font-medium transition-colors duration-200`}>
              <FiHome className='mr-1.5 h-5 w-5' />
              Home
            </Link>
          </div>
          {/* Auth Buttons - Desktop */}
          <div className='hidden md:flex md:items-center md:ml-6'>
            {isAuthenticated ? (
              !isAdminPage && (
                <Link to='/admin' className='btn btn-secondary'>
                  <FiLogIn className='mr-1.5 h-4 w-4' />
                  Admin
                </Link>
              )
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  to='/login'
                  className='text-sm font-medium text-gray-700 hover:text-primary-600'>
                  Log in
                </Link>
                <Link to='/signup' className='btn btn-primary'>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:hidden bg-white border-t border-gray-200`}>
        <div className='pt-2 pb-3 space-y-1'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`${
                location.pathname === link.path
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200'
              } block pl-3 pr-4 py-2 text-base font-medium`}>
              <div className='flex items-center'>
                {link.icon}
                {link.name}
              </div>
            </Link>
          ))}
        </div>
        <div className='pt-4 pb-3 border-t border-gray-200'>
          {isAuthenticated ? (
            <div className='flex items-center px-4'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600'>
                  <FiUser className='h-5 w-5' />
                </div>
              </div>
              <div className='ml-3'>
                <div className='text-sm font-medium text-gray-800'>
                  {user.name}
                </div>
                <div className='text-xs text-gray-500'>View profile</div>
              </div>
              <div className='ml-auto'>
                <button className='text-gray-600 hover:text-gray-800'>
                  <FiLogOut className='h-5 w-5' />
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-2 px-4'>
              <Link
                to='/login'
                className='w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50'>
                Log in
              </Link>
              <Link
                to='/signup'
                className='w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700'>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
