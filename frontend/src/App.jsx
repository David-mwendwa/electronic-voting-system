import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CreateElection from './pages/CreateElection.jsx';
import Vote from './pages/Vote.jsx';
import Results from './pages/Results.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Admin from './pages/Admin.jsx';
import ElectionDetails from './pages/ElectionDetails.jsx';
import { ElectionProvider } from './context/ElectionContext.jsx';
import { VoterProvider } from './context/VoterContext.jsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.jsx';

// Component to handle maintenance mode redirection
const MaintenanceRedirect = () => {
  const navigate = useNavigate();
  const { maintenanceMode } = useSettings();
  const location = useLocation();

  useEffect(() => {
    // If in maintenance mode and not on an allowed path, redirect to home
    if (
      maintenanceMode &&
      !['/admin', '/login'].some((path) => location.pathname.startsWith(path))
    ) {
      navigate('/maintenance');
    }
  }, [maintenanceMode, navigate, location.pathname]);

  return null;
};

// Maintenance page component
const MaintenancePage = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100'>
            <svg
              className='h-10 w-10 text-yellow-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Under Maintenance
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            We're currently performing scheduled maintenance. We'll be back
            online shortly.
          </p>
          <div className='mt-6'>
            <p className='text-sm text-gray-500'>Estimated time: 30 minutes</p>
          </div>
          <div className='mt-6'>
            <button
              onClick={() => navigate('/')}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              Refresh Page
            </button>
            <div className='mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-blue-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-blue-700'>
                    Admin: To disable maintenance mode, go to the{' '}
                    <a
                      href='/admin?tab=settings'
                      className='font-medium text-blue-700 underline hover:text-blue-600'>
                      Settings
                    </a>{' '}
                    page and toggle off the maintenance mode.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <SettingsProvider>
        <ElectionProvider>
          <VoterProvider>
            <MaintenanceRedirect />
            <div className='min-h-screen bg-gray-50 flex flex-col'>
              <Navbar />
              <main className='flex-1 pt-16 w-full'>
                <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                  <Routes>
                    <Route path='/maintenance' element={<MaintenancePage />} />
                    <Route path='/' element={<Home />} />
                    <Route path='/how-it-works' element={<HowItWorks />} />
                    <Route path='/create' element={<CreateElection />} />
                    <Route path='/vote/:electionId' element={<Vote />} />
                    <Route path='/results/:electionId' element={<Results />} />
                    <Route path='/admin' element={<Admin />}>
                      <Route
                        path='elections/:id'
                        element={<ElectionDetails />}
                      />
                    </Route>
                    <Route path='/admin/*' element={<Admin />} />
                  </Routes>
                </div>
              </main>
              <ToastContainer position='top-right' autoClose={3000} />
            </div>
          </VoterProvider>
        </ElectionProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
