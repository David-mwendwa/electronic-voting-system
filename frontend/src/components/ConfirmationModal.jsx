import React from 'react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  note,
  confirmDisabled = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:px-6'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity'
        aria-hidden='true'
      />

      {/* Modal panel */}
      <div className='relative z-10 w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all'>
        <div className='px-6 pt-6 pb-5 sm:px-7 sm:pt-7'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100'>
              <svg
                className='h-7 w-7 text-red-600'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z'
                />
              </svg>
            </div>
            <div className='flex-1 min-w-0'>
              <h3
                className='text-lg sm:text-xl font-semibold leading-6 text-gray-900'
                id='modal-title'>
                {title}
              </h3>
              <p className='mt-2 text-sm text-gray-700'>{message}</p>
              {note && (
                <p className='mt-3 text-xs sm:text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2'>
                  {note}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3'>
          <button
            type='button'
            onClick={onCancel}
            className='inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto'>
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${
              confirmDisabled
                ? 'bg-red-300 cursor-not-allowed focus:ring-red-300'
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
