import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { useAuth } from '../context/AuthContext';
import { FiX, FiCheckCircle, FiLogIn } from 'react-icons/fi';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const Home = () => {
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { elections } = useElection();

  // Use real elections from context and filter to active ones
  const activeElections = elections.filter(
    (election) => election.status === 'Active' || election.status === 'active'
  );

  const handleElectionSelect = (electionId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowElectionModal(false);
    navigate(`/vote/${electionId}`);
  };

  // Modal handlers
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleShowRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleShowLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    // Show success message or redirect
  };

  const features = [
    {
      icon: (
        <svg
          className='w-10 h-10 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          />
        </svg>
      ),
      title: 'Secure Voting',
      description:
        'Blockchain-based security ensures every vote is encrypted and tamper-proof.',
    },
    {
      icon: (
        <svg
          className='w-10 h-10 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 10V3L4 14h7v7l9-11h-7z'
          />
        </svg>
      ),
      title: 'Fast Results',
      description: 'Get real-time results as soon as the voting period ends.',
    },
    {
      icon: (
        <svg
          className='w-10 h-10 text-primary-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          />
        </svg>
      ),
      title: 'Easy to Use',
      description:
        'Simple and intuitive interface for both voters and election organizers.',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Login Modal */}
      {showLoginModal && (
        <div className='fixed z-50 inset-0 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 transition-opacity'
              aria-hidden='true'>
              <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
            </div>
            <span
              className='hidden sm:inline-block sm:align-middle sm:h-screen'
              aria-hidden='true'>
              &#8203;
            </span>
            <Login
              onClose={handleCloseLoginModal}
              onSwitchToRegister={handleShowRegister}
            />
          </div>
        </div>
      )}
      {showRegisterModal && (
        <div className='fixed z-50 inset-0 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 transition-opacity'
              aria-hidden='true'>
              <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
            </div>
            <span
              className='hidden sm:inline-block sm:align-middle sm:h-screen'
              aria-hidden='true'>
              &#8203;
            </span>
            <Register
              onClose={handleCloseRegisterModal}
              onSwitchToLogin={handleShowLogin}
              onRegisterSuccess={handleRegisterSuccess}
            />
          </div>
        </div>
      )}
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-gradient-to-b from-gray-50 to-white'>
        <div className='py-16 md:py-20 lg:py-24'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              <span className='block'>Secure, Transparent</span>
              <span className='text-primary-600'>Voting Solutions</span>
            </h1>

            <p className='mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
              Empowering organizations with blockchain-based voting systems that
              are secure, transparent, and accessible from anywhere.
            </p>
            <div className='mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0'>
              <div className='relative group w-full sm:w-auto'>
                {/* Animated background glow */}
                <div className='absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse overflow-hidden'></div>

                {/* Main button */}
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setShowLoginModal(true);
                    } else {
                      setShowElectionModal(true);
                    }
                  }}
                  className='relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg px-8 py-3.5 border-2 border-primary-400/30 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-400/20 focus:ring-offset-2 focus:ring-offset-white active:scale-95'>
                  <span className='relative flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-white group-hover:animate-bounce'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      style={{
                        animationDuration: '0.5s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2.2'
                        d='M19 14l-7 7m0 0l-7-7m7 7V3'
                      />
                    </svg>
                    <span className='absolute inset-0 w-full h-full bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300'></span>
                  </span>
                  <span className='font-semibold tracking-wide relative'>
                    <span className='relative z-10'>
                      {isAuthenticated ? 'Vote Now' : 'Login to Vote'}
                    </span>
                    <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left'></span>
                  </span>
                </button>
              </div>
              <Link
                to='/how-it-works'
                className='btn btn-secondary text-lg px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200'>
                How It Works
              </Link>
            </div>

            {/* Election Selection Modal */}
            {showElectionModal && (
              <div className='fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6'>
                <div
                  className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity'
                  aria-hidden='true'
                />
                <div className='relative z-10 bg-white/95 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-black/5'>
                  <div className='p-6'>
                    <div className='flex justify-between items-center mb-6'>
                      <h3 className='text-xl font-bold text-gray-900'>
                        Select an Election
                      </h3>
                      <button
                        onClick={() => setShowElectionModal(false)}
                        className='text-gray-400 hover:text-gray-500'>
                        <FiX className='h-6 w-6' />
                      </button>
                    </div>

                    <div className='space-y-3'>
                      {activeElections.length > 0 ? (
                        activeElections.map((election) => (
                          <button
                            key={election.id}
                            onClick={() => handleElectionSelect(election.id)}
                            className='w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left'>
                            <div className='flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-4'>
                              <FiCheckCircle className='h-5 w-5' />
                            </div>
                            <div>
                              <h4 className='font-medium text-gray-900'>
                                {election.title}
                              </h4>
                              <p className='text-sm text-gray-500'>
                                Click to vote in this election
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className='text-center py-8'>
                          <p className='text-gray-500'>
                            No active elections at the moment.
                          </p>
                          <p className='text-sm text-gray-400 mt-2'>
                            Please check back later.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='mt-6'>
                      <button
                        onClick={() => setShowElectionModal(false)}
                        className='w-full btn btn-secondary py-2 px-4'>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className='max-w-7xl mx-auto w-full py-12 space-y-12'>
        {/* Features Highlight Section */}
        <div className='bg-gray-100 rounded-xl p-8 shadow-sm mx-auto'>
          <div className='text-center'>
            <h2 className='text-3xl font-semibold text-gray-900 sm:text-4xl'>
              Why Choose Our Voting Platform?
            </h2>
            <div className='mt-12 grid gap-8 md:grid-cols-3'>
              <div className='bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-primary-600'
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
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Secure & Private
                </h3>
                <p className='text-gray-700'>
                  Your vote is encrypted and anonymous. We use advanced security
                  measures to protect your privacy.
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-primary-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Fast & Easy
                </h3>
                <p className='text-gray-700'>
                  Vote from anywhere, on any device, in just a few clicks. No
                  complicated steps or waiting in line.
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-primary-600'
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
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Transparent Results
                </h3>
                <p className='text-gray-700'>
                  View real-time results and verify that your vote was counted
                  correctly in the final tally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
