import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { login as loginApi } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const { login } = useAuth();

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
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await loginApi({
        email: formData.email,
        password: formData.password,
      });

      if (response.token) {
        login(response.user);
        localStorage.setItem('token', response.token);
        if (onClose) onClose();
        toast.success('Welcome back! You are now logged in.');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
      console.error('Login error:', error);
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
      <div className='bg-white rounded-lg shadow-xl transform transition-all w-full max-w-md'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900'>
              Log in to vote
            </h3>
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
            <div className='p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md'>
              <div className='flex items-center'>
                <FiX className='w-5 h-5 mr-2' />
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
                  className='block text-sm font-medium text-gray-700 mb-1'>
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
                  disabled={isLoading}
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
                  className='block text-sm font-medium text-gray-700 mb-1'>
                  Password
                </label>
                <Link
                  to='/forgot-password'
                  className='text-sm font-medium text-primary-600 hover:text-primary-500'
                  onClick={onClose}>
                  Forgot password?
                </Link>
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
                  disabled={isLoading}
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

            {/* Submit Button */}
            <div className='mt-6'>
              <button
                type='submit'
                disabled={isLoading || (isSubmitting && !isFormValid)}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || (isSubmitting && !isFormValid)
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}>
                {isLoading ? (
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

          {/* Sign Up Link */}
          <div className='mt-4 text-center text-sm'>
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
