import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUser as FiGender,
} from 'react-icons/fi';
import { useVoter } from '../context/VoterContext';
import { useSettings } from '../context/SettingsContext';

const VoterModal = ({ isOpen, onClose, editMode = false }) => {
  const { addVoter, updateVoter, currentVoter, clearCurrentVoter } = useVoter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
  });

  // Initialize form with currentVoter data when in edit mode
  useEffect(() => {
    if (editMode && currentVoter) {
      setFormData({
        name: currentVoter.name || '',
        email: currentVoter.email || '',
        phone: currentVoter.phone || '',
        address: currentVoter.address || '',
        dateOfBirth: currentVoter.dateOfBirth || '',
        gender: currentVoter.gender || '',
      });
    } else {
      // Reset form when opening in add mode
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
      });
    }
  }, [editMode, currentVoter]);
  const [errors, setErrors] = useState({});
  const { registrationEnabled } = useSettings();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleClose = () => {
    clearCurrentVoter();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editMode && currentVoter) {
        const id = currentVoter._id || currentVoter.id;
        await updateVoter(id, {
          ...formData,
          status: currentVoter.status || 'active',
          hasVoted: currentVoter.hasVoted || false,
          gender: formData.gender || null,
        });

        toast.success('Voter updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        await addVoter({
          ...formData,
          status: 'active',
          hasVoted: false,
          gender: formData.gender || null,
        });

        toast.success('Voter added successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
      });

      handleClose();
    } catch (error) {
      console.error('Error adding voter:', error);
      toast.error('Failed to add voter. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (!isOpen) return null;

  if (!registrationEnabled && !editMode) {
    return (
      <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
            aria-label='Close'>
            <FiX className='h-6 w-6' />
          </button>

          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4'>
              <svg
                className='h-8 w-8 text-red-500'
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
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Registration Disabled
            </h2>
            <p className='text-gray-600 mb-4'>
              New voter registration is currently disabled by the system
              administrator.
            </p>
            <div className='bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-blue-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-blue-700'>
                    To enable voter registration, go to the{' '}
                    <a
                      href='/admin?tab=settings'
                      className='text-blue-700 hover:text-blue-900 font-medium underline'
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = '/admin?tab=settings';
                      }}>
                      Admin Settings
                    </a>{' '}
                    and toggle on the "Enable Registration" option.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='fixed inset-0 z-[1000] flex items-center justify-center px-4 py-6 sm:px-6'
      style={{ margin: 0 }}>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity'
        aria-hidden='true'
      />

      {/* Modal panel */}
      <div className='bg-white rounded-lg shadow-xl transform transition-all max-w-lg w-full'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900'>
              {editMode ? 'Edit Voter' : 'Add New Voter'}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-500 focus:outline-none'>
              <FiX className='h-6 w-6' />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700'>
              Full Name <span className='text-red-500'>*</span>
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiUser className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                name='name'
                id='name'
                value={formData.name}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder='John Doe'
              />
            </div>
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'>
              Email <span className='text-red-500'>*</span>
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiMail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='email'
                name='email'
                id='email'
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder='john@example.com'
              />
            </div>
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-medium text-gray-700'>
              Phone Number
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiPhone className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='tel'
                name='phone'
                id='phone'
                value={formData.phone}
                onChange={handleChange}
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                placeholder='+1 (555) 123-4567'
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='address'
              className='block text-sm font-medium text-gray-700'>
              Address
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiMapPin className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                name='address'
                id='address'
                value={formData.address}
                onChange={handleChange}
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                placeholder='123 Main St, City, Country'
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='dateOfBirth'
              className='block text-sm font-medium text-gray-700'>
              Date of Birth
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiCalendar className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='date'
                name='dateOfBirth'
                id='dateOfBirth'
                value={formData.dateOfBirth}
                onChange={handleChange}
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
              />
            </div>
          </div>

          {/* Gender Field */}
          <div>
            <label
              htmlFor='gender'
              className='block text-sm font-medium text-gray-700'>
              Gender <span className='text-red-500'>*</span>
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiGender className='h-5 w-5 text-gray-400' />
              </div>
              <select
                name='gender'
                id='gender'
                value={formData.gender}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2.5 border ${
                  errors.gender ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}>
                <option value=''>Select gender</option>
                <option value='male'>Male</option>
                <option value='female'>Female</option>
                <option value='other'>Other</option>
                <option value='prefer-not-to-say'>Prefer not to say</option>
              </select>
            </div>
            {errors.gender && (
              <p className='mt-1 text-sm text-red-600'>{errors.gender}</p>
            )}
          </div>

          <div className='border-t border-gray-200 pt-4 mt-2'>
            <p className='text-xs text-gray-500 mb-3'>* Required fields</p>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              Cancel
            </button>
            <button
              type='submit'
              className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoterModal;
