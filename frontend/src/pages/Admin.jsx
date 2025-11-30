import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Outlet, useSearchParams, Link } from 'react-router-dom';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useVoter } from '../context/VoterContext';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from '../components/ConfirmationModal';
import { useElection } from '../context/ElectionContext';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiAward,
  FiUserPlus,
  FiPlusCircle,
  FiBarChart2,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUserX,
  FiUser,
  FiPhone,
  FiMail,
  FiUserCheck as FiVerified,
  FiUserX as FiUnverified,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiMoreVertical,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiActivity,
  FiCalendar,
} from 'react-icons/fi';
import { TableSkeleton, Spinner } from '../components/ui/Loaders';
import VoterModal from '../components/VoterModal';
import CreateElection from './CreateElection';

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { voters, loading: votersLoading } = useVoter();
  const { elections, loading: electionsLoading } = useElection();
  const { maintenanceMode } = useSettings();

  // Sync active tab with URL query (?tab=...) so navigation updates the view
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'elections', 'voters', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation items
  const navItems = [
    {
      id: 'dashboard',
      icon: <FiHome className='w-5 h-5' />,
      label: 'Dashboard',
    },
    {
      id: 'elections',
      icon: <FiAward className='w-5 h-5' />,
      label: 'Elections',
    },
    { id: 'voters', icon: <FiUsers className='w-5 h-5' />, label: 'Voters' },
    {
      id: 'settings',
      icon: <FiSettings className='w-5 h-5' />,
      label: 'Settings',
    },
  ];

  // Calculate stats from real data
  const [stats, setStats] = useState([]);

  const dashboardLoading = electionsLoading || votersLoading;

  useEffect(() => {
    if (
      !dashboardLoading &&
      Array.isArray(elections) &&
      Array.isArray(voters)
    ) {
      const activeElections = elections.filter(
        (election) =>
          new Date(election.startDate) <= new Date() &&
          new Date(election.endDate) >= new Date()
      ).length;

      const upcomingElections = elections.filter(
        (election) => new Date(election.startDate) > new Date()
      ).length;

      const pendingVoters = voters.filter((voter) => !voter.isApproved).length;

      const formatDate = (dateString) => {
        return format(parseISO(dateString), 'MMMM d, yyyy');
      };

      setStats([
        {
          name: 'Active Elections',
          value: activeElections,
          icon: <FiAward className='h-6 w-6 text-blue-500' />,
          change:
            activeElections > 0
              ? `+${activeElections} running`
              : 'No active elections',
          changeType: activeElections > 0 ? 'increase' : 'neutral',
        },
        {
          name: 'Total Voters',
          value: voters.length,
          icon: <FiUsers className='h-6 w-6 text-green-500' />,
          change:
            voters.length > 0 ? `${voters.length} registered` : 'No voters yet',
          changeType: 'info',
        },
        {
          name: 'Pending Approvals',
          value: pendingVoters,
          icon: <FiUserCheck className='h-6 w-6 text-yellow-500' />,
          change:
            pendingVoters > 0
              ? `${pendingVoters} pending`
              : 'No pending approvals',
          changeType: pendingVoters > 0 ? 'decrease' : 'neutral',
        },
        {
          name: 'System Status',
          value: maintenanceMode ? 'Maintenance' : 'Operational',
          icon: maintenanceMode ? (
            <FiAlertCircle className='h-6 w-6 text-yellow-500' />
          ) : (
            <FiCheckCircle className='h-6 w-6 text-green-500' />
          ),
          status: maintenanceMode ? 'maintenance' : 'operational',
        },
        {
          name: 'Upcoming Elections',
          value: upcomingElections,
          icon: <FiClock className='h-6 w-6 text-purple-500' />,
          change:
            upcomingElections > 0
              ? `${upcomingElections} scheduled`
              : 'No upcoming elections',
          changeType: 'info',
        },
        {
          name: 'Completed Elections',
          value: elections.length - activeElections - upcomingElections,
          icon: <FiCheckCircle className='h-6 w-6 text-green-500' />,
          change: 'View history',
          changeType: 'info',
        },
      ]);
    }
  }, [dashboardLoading, elections, voters, maintenanceMode]);

  // Recent activity data
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      user: 'System',
      action: 'System initialized',
      time: 'Just now',
      icon: <FiCheckCircle className='h-4 w-4 text-green-500' />,
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const activities = [
      {
        id: 1,
        user: 'System',
        action: 'System initialized',
        time: 'Just now',
        icon: <FiCheckCircle className='h-4 w-4 text-green-500' />,
      },
      ...(elections?.slice(0, 3).map((election, index) => ({
        id: index + 2,
        user: 'Admin',
        action: `Election "${election.title}" ${
          new Date(election.startDate) > new Date() ? 'scheduled' : 'started'
        }`,
        time: formatDistanceToNow(new Date(election.startDate), {
          addSuffix: true,
        }),
        icon: <FiAward className='h-4 w-4 text-blue-500' />,
      })) || []),
      // Recent election updates (based on updatedAt)
      ...(elections || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.startDate) -
            new Date(a.updatedAt || a.startDate)
        )
        .slice(0, 2)
        .map((election, index) => ({
          id: 20 + index,
          user: 'Admin',
          action: `Election "${election.title}" updated`,
          time: formatDistanceToNow(
            new Date(election.updatedAt || election.startDate),
            {
              addSuffix: true,
            }
          ),
          icon: <FiEdit2 className='h-4 w-4 text-purple-500' />,
        })),
      ...(voters?.slice(0, 2).map((voter, index) => ({
        id: index + 5,
        user: 'System',
        action: `New voter created: ${voter.name || voter.email || 'Unknown'}`,
        time: formatDistanceToNow(new Date(voter.createdAt), {
          addSuffix: true,
        }),
        icon: <FiUserPlus className='h-4 w-4 text-blue-500' />,
      })) || []),
    ];

    setRecentActivity(activities.slice(0, 5)); // Show only the 5 most recent activities
  }, [elections, voters]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = () => {
    // Here you would typically handle any logout logic (clearing tokens, etc.)
    // Then navigate to the home page
    navigate('/');
  };

  const handleTabChange = (tabId) => {
    // Always update the active tab
    setActiveTab(tabId);

    // If we're on an election details page, navigate to the tab's main page
    if (window.location.pathname.includes('/admin/elections/')) {
      navigate(`/admin?tab=${tabId}`);
    } else {
      // Otherwise, just update the URL parameters
      setSearchParams({ tab: tabId });
    }

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    // If there's a nested route, render the Outlet
    if (window.location.pathname.includes('/admin/elections/')) {
      return <Outlet />;
    }

    // Otherwise, render the tab content
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent stats={stats} recentActivity={recentActivity} />
        );
      case 'elections':
        return <ElectionsContent />;
      case 'voters':
        return <VotersContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return (
          <DashboardContent stats={stats} recentActivity={recentActivity} />
        );
    }
  };

  return (
    <div className='flex h-screen bg-gray-50 pt-16'>
      {/* Mobile sidebar backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className='fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:pt-0`}>
        <div className='flex h-full flex-col'>
          {/* Logo */}
          <div className='flex h-16 items-center justify-between border-b border-gray-200 px-4'>
            <div className='flex items-center'>
              <FiBarChart2 className='h-8 w-8 text-primary-600' />
              <span className='ml-2 text-xl font-bold text-gray-800'>
                VoteAdmin
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className='rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden'>
              <FiX className='h-6 w-6' />
            </button>
          </div>

          {/* Navigation */}
          <nav className='flex-1 overflow-y-auto py-4'>
            <div className='space-y-1 px-2'>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium ${
                    activeTab === item.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  <span className='mr-3'>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* User profile and logout */}
          <div className='border-t border-gray-200 p-4'>
            <div className='flex items-center'>
              <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500'>
                <FiUserPlus className='h-5 w-5' />
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-700'>Admin User</p>
                <p className='text-xs text-gray-500'>Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className='ml-auto rounded-full p-1 text-gray-500 hover:bg-gray-100'
                title='Sign out'>
                <FiLogOut className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Top navigation */}
        <header className='fixed top-0 left-0 right-0 z-40 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6'>
          <div className='flex items-center'>
            <button
              onClick={toggleSidebar}
              className='mr-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden'>
              <FiMenu className='h-6 w-6' />
            </button>
            <h1 className='text-lg font-medium text-gray-900'>
              {navItems.find((item) => item.id === activeTab)?.label ||
                'Dashboard'}
            </h1>
          </div>

          <div className='flex items-center space-x-4'>
            <button className='rounded-full p-1 text-gray-500 hover:bg-gray-100'>
              <span className='sr-only'>View notifications</span>
              <div className='relative'>
                <FiClock className='h-5 w-5' />
                <span className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500'></span>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 mt-16 lg:mt-0'>
          {activeTab === 'dashboard' ? (
            <DashboardContent
              stats={stats}
              recentActivity={recentActivity}
              isLoading={dashboardLoading}
            />
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
};

// Shared error alert
const ErrorAlert = ({ label, error }) => (
  <div className='bg-red-50 border-l-4 border-red-400 p-4'>
    <div className='flex'>
      <div className='flex-shrink-0'>
        <FiAlertCircle className='h-5 w-5 text-red-400' aria-hidden='true' />
      </div>
      <div className='ml-3'>
        <p className='text-sm text-red-700'>
          Error loading{(label && ` ${label}`) || ''}: {error}
        </p>
      </div>
    </div>
  </div>
);

// Dashboard Content Component
const DashboardContent = ({ stats, recentActivity, isLoading }) => {
  const navigate = useNavigate();
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className='space-y-6'>
      {/* Welcome Header */}
      <div className='bg-white shadow rounded-lg p-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard Overview</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Welcome back! Here's what's happening with your elections today.
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {stats.map((stat) => (
          <div
            key={stat.name}
            className='overflow-hidden rounded-lg bg-white px-6 py-5 shadow hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center'>
              <div
                className={`flex-shrink-0 rounded-md p-3 ${
                  stat.status === 'maintenance'
                    ? 'bg-yellow-50'
                    : 'bg-primary-50'
                }`}>
                {stat.icon}
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  {stat.name}
                </dt>
                <dd className='flex flex-col sm:flex-row sm:items-baseline'>
                  <div className='text-2xl font-semibold text-gray-900'>
                    {stat.value}
                  </div>
                  {stat.change && (
                    <span
                      className={`mt-1 sm:mt-0 sm:ml-2 text-sm font-medium ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : stat.changeType === 'decrease'
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}>
                      {stat.change}
                    </span>
                  )}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recent Activity */}
        <div className='bg-white shadow sm:rounded-lg lg:col-span-2'>
          <div className='px-4 py-5 sm:px-6 border-b border-gray-200'>
            <h3 className='text-lg font-semibold leading-6 text-gray-900'>
              Recent Activity
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Latest updates across elections and voters
            </p>
          </div>
          <div className='divide-y divide-gray-200'>
            {recentActivity.length > 0 ? (
              <ul className='divide-y divide-gray-200'>
                {recentActivity.map((activity) => (
                  <li
                    key={activity.id}
                    className='px-4 py-4 sm:px-6 hover:bg-gray-50'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>{activity.icon}</div>
                      <div className='ml-4'>
                        <p className='text-sm font-medium text-gray-900'>
                          {activity.action}
                        </p>
                        <p className='text-xs text-gray-500 mt-0.5'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='p-6 text-center text-gray-500'>
                No recent activities to display
              </div>
            )}
          </div>
          <div className='bg-gray-50 px-4 py-3 text-right sm:px-6 rounded-b-lg'>
            <button
              type='button'
              onClick={() => navigate('/admin?tab=elections')}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              View all activity
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white shadow sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6 border-b border-gray-200'>
            <h3 className='text-lg font-medium leading-6 text-gray-900'>
              Quick Actions
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Common tasks and shortcuts
            </p>
          </div>
          <div className='p-4 space-y-3'>
            <button
              onClick={() => navigate('/admin?tab=elections')}
              className='w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
              <FiPlusCircle className='-ml-1 mr-2 h-5 w-5' />
              New Election
            </button>
            <button
              onClick={() => navigate('/admin?tab=voters')}
              className='w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              <FiUserPlus className='-ml-1 mr-2 h-5 w-5' />
              Add Voter
            </button>
            <button
              onClick={() => navigate('/admin?tab=settings')}
              className='w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              <FiSettings className='-ml-1 mr-2 h-5 w-5 text-gray-500' />
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Elections Content Component
const ElectionsContent = () => {
  const navigate = useNavigate();
  const { elections, loading, error } = useElection();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const electionsPerPage = 10;

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMMM d, yyyy h:mm a');
  };

  const sortedElections = useMemo(() => {
    if (!elections) return [];

    return [...elections].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [elections, sortConfig]);

  // Get current elections
  const indexOfLastElection = currentPage * electionsPerPage;
  const indexOfFirstElection = indexOfLastElection - electionsPerPage;
  const currentElections = sortedElections.slice(
    indexOfFirstElection,
    indexOfLastElection
  );
  const totalPages = Math.ceil(sortedElections.length / electionsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <ErrorAlert label='elections' error={error} />;
  }

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const getStatusBadge = (status) => {
    const normalized = (status || '').toLowerCase();
    const statusClasses = {
      draft: 'bg-yellow-100 text-yellow-800',
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const label =
      status && typeof status === 'string'
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : 'Unknown';

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusClasses[normalized] || 'bg-gray-100 text-gray-800'
        }`}>
        {label}
      </span>
    );
  };

  if (showCreateForm) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between mb-6'>
          <button
            onClick={handleCancelCreate}
            className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600'>
            <FiArrowLeft className='mr-2 h-5 w-5' />
            Back to Elections
          </button>
        </div>
        <div className='bg-white shadow-sm rounded-lg p-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Create New Election
          </h2>
          <CreateElection onCancel={handleCancelCreate} />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
      <div className='px-4 py-4 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          <div className='mb-3 sm:mb-0'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Election Management
            </h2>
            <p className='mt-1 text-xs sm:text-sm text-gray-500'>
              {elections.length === 0
                ? 'No elections found. Create your first election to get started.'
                : `Showing ${elections.length} election${
                    elections.length !== 1 ? 's' : ''
                  }`}
            </p>
          </div>
          <button
            type='button'
            onClick={handleCreateNew}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
            <FiPlus className='-ml-1 mr-2 h-5 w-5' />
            New Election
          </button>
        </div>
      </div>

      <div className='overflow-x-auto rounded-lg border border-gray-200'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('title')}>
                <div className='flex items-center'>
                  <FiAward className='mr-2 flex-shrink-0' />
                  <span>Election {getSortIndicator('title')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('status')}>
                <div className='flex items-center'>
                  <FiActivity className='mr-2 flex-shrink-0' />
                  <span>Status {getSortIndicator('status')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('startDate')}>
                <div className='flex items-center'>
                  <FiCalendar className='mr-2 flex-shrink-0' />
                  <span>Dates {getSortIndicator('startDate')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('totalVoters')}>
                <div className='flex items-center'>
                  <FiBarChart2 className='mr-2 flex-shrink-0' />
                  <span>Statistics {getSortIndicator('totalVoters')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>
                <span className='sr-only'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {currentElections.length > 0 ? (
              currentElections.map((election) => (
                <tr
                  key={election._id || election.id}
                  className='hover:bg-gray-50 transition-colors'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center min-w-[200px]'>
                      <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                        <FiAward className='h-5 w-5 text-indigo-600' />
                      </div>
                      <div className='ml-3 overflow-hidden'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {election.title}
                        </div>
                        <div
                          className='text-xs text-gray-500 font-mono'
                          title={election._id || election.id}>
                          ID: {election._id || election.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    {getStatusBadge(election.status)}
                  </td>
                  <td className='hidden md:table-cell px-4 py-3'>
                    <div className='text-sm text-gray-900'>
                      <div className='flex items-center'>
                        <FiCalendar className='h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0' />
                        <span>
                          {election.startDate
                            ? format(
                                parseISO(election.startDate),
                                'MMM d, yyyy'
                              )
                            : 'N/A'}
                        </span>
                      </div>
                      <div className='flex items-center mt-1'>
                        <FiCalendar className='h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0' />
                        <span>
                          {election.endDate
                            ? format(parseISO(election.endDate), 'MMM d, yyyy')
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className='hidden lg:table-cell px-4 py-3'>
                    <div className='text-sm text-gray-900'>
                      <div className='flex items-center'>
                        <FiUsers className='h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0' />
                        <span>
                          {typeof election.totalVoters === 'number'
                            ? election.totalVoters
                            : Array.isArray(election.voters)
                              ? election.voters.length
                              : election.voters || 0}{' '}
                          voters
                        </span>
                      </div>
                      <div className='flex items-center mt-1'>
                        <FiUserCheck className='h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0' />
                        <span>
                          {Array.isArray(election.candidates)
                            ? election.candidates.length
                            : election.candidates || 0}{' '}
                          candidates
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <div className='flex items-center justify-end space-x-1'>
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/elections/${election._id || election.id}`
                          )
                        }
                        className='text-gray-400 hover:text-primary-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors'
                        title='View election'>
                        <FiEye className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/elections/${election._id || election.id}?tab=settings`
                          )
                        }
                        className='text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 transition-colors'
                        title='Edit election'>
                        <FiEdit2 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/elections/${election._id || election.id}?tab=settings#delete`
                          )
                        }
                        className='text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors'
                        title='Delete election'>
                        <FiTrash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='5' className='px-6 py-12 text-center'>
                  <div className='flex flex-col items-center justify-center text-gray-400'>
                    <FiAward className='h-12 w-12 mb-3 text-gray-300' />
                    <p className='text-sm font-medium text-gray-500'>
                      No elections found
                    </p>
                    <p className='text-xs mt-1 text-gray-400 max-w-xs'>
                      Get started by clicking the 'New Election' button above
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedElections.length > electionsPerPage && (
        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}>
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}>
              Next
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing{' '}
                <span className='font-medium'>{indexOfFirstElection + 1}</span>{' '}
                to{' '}
                <span className='font-medium'>
                  {Math.min(indexOfLastElection, sortedElections.length)}
                </span>{' '}
                of <span className='font-medium'>{sortedElections.length}</span>{' '}
                elections
              </p>
            </div>
            <div>
              <nav
                className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}>
                  <span className='sr-only'>Previous</span>
                  <svg
                    className='h-5 w-5'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'>
                    <path
                      fillRule='evenodd'
                      d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first 2 pages, current page, and last 2 pages
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}>
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                    ...
                  </span>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}>
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}>
                  <span className='sr-only'>Next</span>
                  <svg
                    className='h-5 w-5'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'>
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VotersContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voterToDelete, setVoterToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const votersPerPage = 10;
  const {
    voters,
    loading,
    error,
    setCurrentVoter,
    deleteVoter,
    currentVoter,
    clearCurrentVoter,
    updateVoterStatus,
  } = useVoter();

  const handleDeleteClick = (voter) => {
    setVoterToDelete(voter);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (voterToDelete) {
      try {
        const id = voterToDelete._id || voterToDelete.id;
        await deleteVoter(id);
        toast.success('Voter deleted successfully');
      } catch (error) {
        toast.error('Failed to delete voter');
      }
      setShowDeleteModal(false);
      setVoterToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setVoterToDelete(null);
  };

  const filteredVoters = useMemo(() => {
    let result = [...voters];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (voter) =>
          voter.name?.toLowerCase().includes(term) ||
          voter.email?.toLowerCase().includes(term) ||
          voter.phone?.toLowerCase().includes(term) ||
          voter.voterId?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((voter) =>
        statusFilter === 'active' ? voter.isActive : !voter.isActive
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [voters, searchTerm, statusFilter, sortConfig]);

  // Get current voters for pagination
  const indexOfLastVoter = currentPage * votersPerPage;
  const indexOfFirstVoter = indexOfLastVoter - votersPerPage;
  const currentVoters = filteredVoters.slice(
    indexOfFirstVoter,
    indexOfLastVoter
  );
  const totalPages = Math.ceil(filteredVoters.length / votersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <ErrorAlert label='voters' error={error} />;
  }

  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
      {/* Header with search and actions */}
      <div className='px-4 py-4 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
          <div className='mb-3 sm:mb-0'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Voter Management
            </h2>
            <p className='mt-1 text-xs sm:text-sm text-gray-500'>
              {voters.length === 0
                ? 'No voters found. Add a voter to get started.'
                : `Showing ${indexOfFirstVoter + 1}-${Math.min(
                    indexOfLastVoter,
                    filteredVoters.length
                  )} of ${filteredVoters.length} voter${
                    filteredVoters.length !== 1 ? 's' : ''
                  }`}
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2 sm:flex sm:space-x-2 w-full sm:w-auto'>
            <div className='relative col-span-2 sm:w-64'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FiSearch className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type='text'
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm h-9'
                placeholder='Search voters...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className='relative w-full sm:w-40'>
              <select
                className='appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm h-9'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value='all'>All Statuses</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                <svg
                  className='fill-current h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'>
                  <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                </svg>
              </div>
            </div>
          </div>

          <button
            type='button'
            onClick={() => {
              clearCurrentVoter();
              setIsModalOpen(true);
            }}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
            <FiUserPlus className='-ml-1 mr-2 h-5 w-5' />
            Add Voter
          </button>
        </div>
      </div>

      {/* Voters Table */}
      <div className='overflow-x-auto rounded-lg border border-gray-200'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('name')}>
                <div className='flex items-center'>
                  <FiUser className='mr-2 flex-shrink-0' />
                  <span>Voter {getSortIndicator('name')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('email')}>
                <div className='flex items-center'>
                  <FiMail className='mr-2 flex-shrink-0' />
                  <span>Email {getSortIndicator('email')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('phone')}>
                <div className='flex items-center'>
                  <FiPhone className='mr-2 flex-shrink-0' />
                  <span>Contact {getSortIndicator('phone')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap'
                onClick={() => requestSort('isActive')}>
                <div className='flex items-center'>
                  <FiUserCheck className='mr-2 flex-shrink-0' />
                  <span>Status {getSortIndicator('isActive')}</span>
                </div>
              </th>
              <th
                scope='col'
                className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>
                <span className='sr-only'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {currentVoters.length > 0 ? (
              currentVoters.map((voter) => (
                <tr
                  key={voter.id}
                  className='hover:bg-gray-50 transition-colors'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center min-w-[200px]'>
                      <div className='flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center'>
                        <FiUser className='h-5 w-5 text-primary-600' />
                      </div>
                      <div className='ml-3 overflow-hidden'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {voter.name}
                        </div>
                        <div
                          className='text-xs text-gray-500 font-mono'
                          title={voter.id}>
                          ID: {voter.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='hidden md:table-cell px-4 py-3'>
                    <div
                      className='text-sm text-gray-900 break-words max-w-[200px]'
                      title={voter.email}>
                      {voter.email}
                    </div>
                    {voter.isVerified && (
                      <div className='flex items-center mt-1 text-xs text-green-600'>
                        <FiVerified className='h-3 w-3 mr-1 flex-shrink-0' />
                        <span className='truncate'>Verified</span>
                      </div>
                    )}
                  </td>
                  <td className='hidden lg:table-cell px-4 py-3'>
                    <div className='text-sm text-gray-900'>
                      {voter.phone || 'N/A'}
                    </div>
                    {voter.address && (
                      <div
                        className='text-xs text-gray-500 break-words max-w-[180px]'
                        title={voter.address}>
                        {voter.address}
                      </div>
                    )}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span
                      onClick={async () => {
                        try {
                          await updateVoterStatus(voter.id, !voter.isActive);
                          toast.success(
                            `Voter ${
                              voter.isActive ? 'deactivated' : 'activated'
                            } successfully`
                          );
                        } catch (error) {
                          toast.error(
                            `Failed to update voter status: ${error.message}`
                          );
                        }
                      }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        voter.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}>
                      {voter.isActive ? (
                        <>
                          <FiCheckCircle className='mr-1.5 h-3.5 w-3.5 flex-shrink-0' />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <FiUserX className='mr-1.5 h-3.5 w-3.5 flex-shrink-0' />
                          <span>Inactive</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <div className='flex items-center justify-end space-x-1'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentVoter(voter);
                          setIsModalOpen(true);
                        }}
                        className='text-gray-400 hover:text-primary-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors'
                        title='Edit voter'>
                        <FiEdit2 className='h-4 w-4' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(voter);
                        }}
                        className='text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors'
                        title='Delete voter'>
                        <FiTrash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='5' className='px-6 py-12 text-center'>
                  <div className='flex flex-col items-center justify-center text-gray-400'>
                    <FiUserX className='h-12 w-12 mb-3 text-gray-300' />
                    <p className='text-sm font-medium text-gray-500'>
                      No voters found
                    </p>
                    <p className='text-xs mt-1 text-gray-400 max-w-xs'>
                      {searchTerm
                        ? 'Try adjusting your search or filter criteria'
                        : 'Get started by clicking the "Add Voter" button above'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredVoters.length > votersPerPage && (
        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}>
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}>
              Next
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing{' '}
                <span className='font-medium'>{indexOfFirstVoter + 1}</span> to{' '}
                <span className='font-medium'>
                  {Math.min(indexOfLastVoter, filteredVoters.length)}
                </span>{' '}
                of <span className='font-medium'>{filteredVoters.length}</span>{' '}
                voters
              </p>
            </div>
            <div>
              <nav
                className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}>
                  <span className='sr-only'>Previous</span>
                  <svg
                    className='h-5 w-5'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'>
                    <path
                      fillRule='evenodd'
                      d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first 2 pages, current page, and last 2 pages
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}>
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}

                {/* Ellipsis for large number of pages */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                    ...
                  </span>
                )}

                {/* Last page button */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}>
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}>
                  <span className='sr-only'>Next</span>
                  <svg
                    className='h-5 w-5'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'>
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <VoterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        editMode={!!currentVoter}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        title='Delete Voter'
        message='Are you sure you want to delete this voter? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmButtonClass='bg-red-600 hover:bg-red-700 focus:ring-red-500'
      />
    </div>
  );
};

const SettingsContent = () => {
  const {
    maintenanceMode,
    registrationEnabled,
    toggleMaintenanceMode,
    toggleRegistration,
    isLoading,
    error,
  } = useSettings();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  if (error) {
    return <ErrorAlert label='settings' error={error} />;
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-lg bg-white p-6 shadow'>
        <h2 className='text-lg font-medium text-gray-900'>System Settings</h2>
        <div className='mt-6 space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>
                Maintenance Mode
              </h3>
              <p className='text-sm text-gray-500'>
                Temporarily disable the voting system for maintenance.
              </p>
            </div>
            <button
              type='button'
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                maintenanceMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              role='switch'
              aria-checked={maintenanceMode}
              onClick={toggleMaintenanceMode}
              aria-labelledby='maintenance-mode-label'>
              <span className='sr-only'>Toggle maintenance mode</span>
              <span
                aria-hidden='true'
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
            </button>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>
                Enable Registration
              </h3>
              <p className='text-sm text-gray-500'>
                Allow new users to register for the voting system.
              </p>
            </div>
            <button
              type='button'
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                registrationEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              role='switch'
              aria-checked={registrationEnabled}
              onClick={toggleRegistration}
              aria-labelledby='registration-enabled-label'>
              <span className='sr-only'>Toggle registration</span>
              <span
                aria-hidden='true'
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  registrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
            </button>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>
                Enable Email Notifications
              </h3>
              <p className='text-sm text-gray-500'>
                Send email notifications for important system events.
              </p>
            </div>
            <button
              type='button'
              className='relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
              role='switch'
              aria-checked='false'
              aria-labelledby='email-notifications-label'>
              <span className='sr-only'>Toggle email notifications</span>
              <span
                aria-hidden='true'
                className='pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0'></span>
            </button>
          </div>
        </div>

        <div className='mt-8 pt-6 border-t border-gray-200'>
          <h3 className='text-sm font-medium text-gray-900 mb-4'>
            Danger Zone
          </h3>
          <div className='rounded-md bg-red-50 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <FiAlertCircle
                  className='h-5 w-5 text-red-400'
                  aria-hidden='true'
                />
              </div>
              <div className='ml-3'>
                <h4 className='text-sm font-medium text-red-800'>
                  Delete all data
                </h4>
                <div className='mt-2 text-sm text-red-700'>
                  <p>
                    This will permanently delete all elections, votes, and user
                    data. This action cannot be undone.
                  </p>
                </div>
                <div className='mt-4'>
                  <button
                    type='button'
                    className='inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'>
                    Delete all data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
