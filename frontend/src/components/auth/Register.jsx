import { useState } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
    passwordConfirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    dateOfBirth: false,
    gender: false,
    password: false,
    confirmPassword: false,
  });

  const { login, register } = useAuth();

  // Form validation
  const validate = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        errors.dateOfBirth = 'Date of birth must be in the past';
      }
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    setIsLoading(true);
    setError('');

    try {
      // Prepare user data for registration
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
        ...(formData.gender && { gender: formData.gender }),
      };

      // Register the user
      const result = await register(userData);

      if (result.success) {
        const user = result.data?.user;
        const token = result.data?.token;

        if (user && token) {
          // Log the user in automatically with token so AuthContext can persist it
          login({ ...user, token });
        }

        // Close the modal
        if (onClose) onClose();

        // Show success message from the server or a default one
        toast.success(
          result.message || 'Registration successful! You are now logged in.'
        );
      } else {
        // Handle any non-thrown errors
        setError(result.message);

        // If there are field-specific errors, log them
        if (result.errors) {
          console.error('Registration validation errors:', result.errors);
        }
      }
    } catch (err) {
      // This should only be reached for unexpected errors since we're handling API errors in authService
      const errorMessage =
        err.message || 'An unexpected error occurred during registration.';
      setError(errorMessage);
      console.error('Unexpected registration error:', err);
    } finally {
      setIsLoading(false);
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
      <div className='bg-white rounded-lg shadow-xl transform transition-all w-full max-w-md overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900 text-left'>
              Create Your Voting Account
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
            <div className='p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md text-left'>
              <div className='flex items-center'>
                <FiX className='w-5 h-5 mr-2' />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Name Field */}
            <div className='text-left'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-1 text-left'>
                Full Name <span className='text-red-500'>*</span>
              </label>
              <div className='relative mt-1 rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <FiUser className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    touched.name && errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  } rounded-md focus:outline-none focus:ring-1 focus:border-primary-500`}
                  placeholder='John Mwangi'
                  disabled={isLoading}
                />
              </div>
              {touched.name && errors.name && (
                <p className='mt-1 text-sm text-red-600 text-left'>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className='text-left'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1 text-left'>
                Email Address <span className='text-red-500'>*</span>
              </label>
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
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  } rounded-md focus:outline-none focus:ring-1 focus:border-primary-500`}
                  placeholder='email@example.co.ke'
                  disabled={isLoading}
                />
              </div>
              {touched.email && errors.email && (
                <p className='mt-1 text-sm text-red-600 text-left'>
                  {errors.email}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Date of Birth Field */}
              <div className='text-left'>
                <label
                  htmlFor='dateOfBirth'
                  className='block text-sm font-medium text-gray-700 mb-1 text-left'>
                  Date of Birth
                </label>
                <div className='relative mt-1 rounded-md shadow-sm'>
                  <input
                    type='date'
                    id='dateOfBirth'
                    name='dateOfBirth'
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onBlur={() => setTouched({ ...touched, dateOfBirth: true })}
                    className={`block w-full pl-3 pr-3 py-2 border ${
                      touched.dateOfBirth && errors.dateOfBirth
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    } rounded-md focus:outline-none focus:ring-1 focus:border-primary-500`}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                  />
                </div>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <p className='mt-1 text-sm text-red-600 text-left'>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Gender Field */}
              <div className='text-left'>
                <label
                  htmlFor='gender'
                  className='block text-sm font-medium text-gray-700 mb-1 text-left'>
                  Gender
                </label>
                <div className='relative mt-1 rounded-md shadow-sm'>
                  <select
                    id='gender'
                    name='gender'
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={() => setTouched({ ...touched, gender: true })}
                    className='block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500'
                    disabled={isLoading}>
                    <option value=''>Select Gender</option>
                    <option value='male'>Male</option>
                    <option value='female'>Female</option>
                    <option value='other'>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className='text-left'>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1 text-left'>
                Password <span className='text-red-500'>*</span>
              </label>
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
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    touched.password && errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  } rounded-md focus:outline-none focus:ring-1 focus:border-primary-500`}
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

            {/* Confirm Password Field */}
            <div className='text-left'>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-1 text-left'>
                Confirm Password <span className='text-red-500'>*</span>
              </label>
              <div className='relative mt-1 rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <FiLock className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() =>
                    setTouched({ ...touched, confirmPassword: true })
                  }
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-500'
                  } rounded-md focus:outline-none focus:ring-1 focus:border-primary-500`}
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
              {touched.confirmPassword && errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600 text-left'>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className='mt-6'>
              <button
                type='submit'
                disabled={isLoading || !isFormValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || !isFormValid
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className='mt-4 text-center text-sm'>
            <p className='text-gray-600'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={onSwitchToLogin}
                className='font-medium text-primary-600 hover:text-primary-500 focus:outline-none'>
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
