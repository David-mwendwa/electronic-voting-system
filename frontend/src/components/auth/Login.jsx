import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestCredentials, setShowTestCredentials] = useState(true);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const { login, rememberMe, setRememberMe } = useAuth();
  const navigate = useNavigate();

  // Test credentials for different user roles
  const testCredentials = [
    {
      name: 'System Administrator',
      email: 'sysadmin@evs.ke',
      password: 'sysadmin123',
      description: 'Full access to all system features and settings.',
      role: 'sysadmin',
    },
    {
      name: 'Administrator',
      email: 'admin@evs.ke',
      password: 'admin123',
      description: 'Manage elections, candidates, and view results.',
      role: 'admin',
    },
    {
      name: 'Voter',
      email: 'voter@evs.ke',
      password: 'voter123',
      description: 'View elections and cast your vote.',
      role: 'user',
    },
  ];

  // Auto-fill form with test credentials
  const useTestCredentials = (email, password) => {
    setFormData({
      email,
      password,
    });
    setTouched({
      email: true,
      password: true,
    });
    setShowTestCredentials(false);
  };

  // Form validation
  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const errors = validate();
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Call unified login (backend + session) with the form data
      const data = await login(formData, rememberMe);

      const role = data?.user?.role;
      if (role === 'admin' || role === 'sysadmin') {
        navigate('/admin');
      }

      toast.success('Welcome back! You are now logged in.');
      if (onClose) onClose();
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6 sm:px-6'
      style={{ margin: 0 }}>
      {/* Backdrop with blur effect */}
      <div
        className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity'
        aria-hidden='true'
      />
      {/* Modal panel */}
      <div className='bg-white rounded-xl shadow-xl transform transition-all w-full max-w-md'>
        <div className='px-6 py-4 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900'>
                Sign in to EVS
              </h3>
              <p className='mt-0.5 text-[11px] sm:text-xs text-gray-500 leading-snug'>
                Use the demo accounts below, or sign in with the account you
                registered with or one provided by your administrator.
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-500 focus:outline-none'>
              <FiX className='h-5 w-5' />
            </button>
          </div>
        </div>
        <div className='px-6 py-4'>
          {/* Error Message */}
          {error && (
            <div className='p-3 mb-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-100 rounded-md'>
              <div className='flex items-center'>
                <FiX className='w-4 h-4 mr-2' />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Email Field */}
            <div>
              <div className='text-left'>
                <label
                  htmlFor='email'
                  className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Email Address
                </label>
              </div>
              <div className='relative mt-1 rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <FiMail className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    touched.email && errors.email
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-1 ${
                    touched.email && errors.email
                      ? 'focus:ring-red-500'
                      : 'focus:ring-primary-500'
                  } focus:border-primary-500`}
                  placeholder='email@example.com'
                  disabled={isSubmitting}
                />
              </div>
              {touched.email && errors.email && (
                <p className='mt-1 text-sm text-red-600 text-left'>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  Password
                </label>
              </div>
              <div className='relative mt-1 rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <FiLock className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    touched.password && errors.password
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-1 ${
                    touched.password && errors.password
                      ? 'focus:ring-red-500'
                      : 'focus:ring-primary-500'
                  } focus:border-primary-500`}
                  placeholder='••••••••'
                  disabled={isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500'
                  tabIndex='-1'>
                  {showPassword ? (
                    <FiEyeOff className='w-5 h-5' />
                  ) : (
                    <FiEye className='w-5 h-5' />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className='mt-1 text-sm text-red-600 text-left'>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className='flex items-center justify-between mt-4'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-700'>
                  Remember me
                </label>
              </div>

              <Link
                to='/forgot-password'
                className='text-sm font-medium text-primary-600 hover:text-primary-500'
                onClick={onClose}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className='mt-6'>
              <button
                type='submit'
                disabled={isSubmitting || !isFormValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting || !isFormValid
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}>
                {isSubmitting ? (
                  <>
                    <svg
                      className='w-4 h-4 mr-2 -ml-1 text-white animate-spin'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Test Credentials Section */}
          <div className='mt-6'>
            <button
              type='button'
              onClick={() => setShowTestCredentials(!showTestCredentials)}
              className='w-full text-center text-sm font-semibold text-primary-700 hover:text-primary-600 outline-none focus:outline-none focus-visible:outline-none focus:ring-0'>
              {showTestCredentials
                ? 'Hide demo login accounts'
                : 'Need demo login accounts for testing?'}
            </button>

            {showTestCredentials && (
              <div className='mt-3 p-4 bg-primary-50 rounded-lg border border-primary-100'>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                  Demo accounts for testing
                </h4>
                <p className='text-xs text-gray-500 mb-3'>
                  Click any account to auto-fill credentials
                </p>
                <div className='space-y-2'>
                  {testCredentials.map((account, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        useTestCredentials(account.email, account.password)
                      }
                      className='p-2 text-sm bg-white rounded border border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors'>
                      <div className='font-medium text-gray-900'>
                        {account.name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {account.email} / {account.password}
                      </div>
                      <div className='text-xs text-gray-400 mt-1'>
                        {account.description}
                      </div>
                    </div>
                  ))}
                </div>
                <p className='mt-3 text-xs text-gray-500'>
                  Note: These are test accounts. In production, users would
                  create their own accounts.
                </p>
              </div>
            )}
          </div>

          {/* Sign Up Link */}
          <div className='mt-6 text-center text-sm'>
            <p className='text-gray-600'>
              Don't have an account?{' '}
              <button
                type='button'
                onClick={() => {
                  if (onSwitchToRegister) {
                    onSwitchToRegister();
                  }
                }}
                className='font-medium text-primary-600 hover:text-primary-500 focus:outline-none'>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
