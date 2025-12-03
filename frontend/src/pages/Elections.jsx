import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner, TableSkeleton } from '../components/ui/Loaders.jsx';
import { format, parseISO } from 'date-fns';
import { FiCheckCircle, FiBarChart2, FiEye } from 'react-icons/fi';

const statusStyles = {
  draft: 'bg-yellow-100 text-yellow-800',
  upcoming: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const getStatusPill = (status) => {
  const normalized = (status || '').toLowerCase();
  const label =
    status && typeof status === 'string'
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        statusStyles[normalized] || 'bg-gray-100 text-gray-800'
      }`}>
      {label}
    </span>
  );
};

const Elections = () => {
  const navigate = useNavigate();
  const { elections, loading, error } = useElection();
  const { user } = useAuth();

  const currentUserId = user?._id || user?.id || null;

  const sortedElections = useMemo(() => {
    if (!Array.isArray(elections)) return [];

    return [...elections].sort((a, b) => {
      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aStart - bStart;
    });
  }, [elections]);

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12'>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12'>
        <div className='bg-red-50 border-l-4 border-red-400 p-4 rounded-md'>
          <p className='text-sm text-red-700'>
            There was a problem loading elections. Please try again or contact
            your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-20 pb-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Page header */}
        <div className='mb-8 text-center'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
            Elections
          </h1>
          <p className='text-sm md:text-base text-gray-600 max-w-2xl mx-auto'>
            Here you can see all elections you are allowed to participate in.
            Each election shows its status and key dates. When an election is
            active, you can open it and cast your vote.
          </p>
        </div>

        {/* Empty state */}
        {sortedElections.length === 0 && (
          <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
            <h2 className='text-lg font-semibold text-gray-900 mb-2'>
              No elections available yet
            </h2>
            <p className='text-sm text-gray-500 mb-4'>
              Once an administrator creates and publishes elections for your
              organization, they will appear here.
            </p>
            <Link
              to='/'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
              Back to Home
            </Link>
          </div>
        )}

        {/* Elections list */}
        {sortedElections.length > 0 && (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {sortedElections.map((election) => {
              const id = election._id || election.id;
              const status = (election.status || '').toLowerCase();
              const isActive = status === 'active';
              const isCompleted = status === 'completed';
              const hasVoted =
                !!currentUserId &&
                (election.hasVotedForCurrentUser ||
                  (Array.isArray(election.voters) &&
                    election.voters.some(
                      (voterId) => String(voterId) === String(currentUserId)
                    )));

              return (
                <div
                  key={id}
                  className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full'>
                  <div className='p-5 flex-1 flex flex-col'>
                    <div className='mb-2'>
                      <h2 className='text-base sm:text-lg font-semibold text-gray-900 mr-2 line-clamp-2'>
                        {election.title || 'Untitled Election'}
                      </h2>
                    </div>
                    <div className='flex items-center justify-between mb-3'>
                      <div>{getStatusPill(election.status)}</div>
                      {hasVoted && (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200'>
                          You voted
                        </span>
                      )}
                    </div>

                    {election.description && (
                      <p className='text-sm text-gray-600 mb-3 line-clamp-3'>
                        {election.description}
                      </p>
                    )}

                    <div className='mt-auto space-y-1 text-xs text-gray-500'>
                      {election.startDate && (
                        <p>
                          <span className='font-medium text-gray-700'>
                            Starts:
                          </span>{' '}
                          {format(
                            parseISO(election.startDate),
                            'MMM d, yyyy HH:mm'
                          )}
                        </p>
                      )}
                      {election.endDate && (
                        <p>
                          <span className='font-medium text-gray-700'>
                            Ends:
                          </span>{' '}
                          {format(
                            parseISO(election.endDate),
                            'MMM d, yyyy HH:mm'
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3'>
                    <p className='text-xs text-gray-500'>
                      {hasVoted
                        ? 'You have already voted in this election. You can review the final results.'
                        : isActive
                          ? 'This election is currently open for voting.'
                          : status === 'upcoming'
                            ? 'This election will open soon. Check back later to vote.'
                            : isCompleted
                              ? 'This election has ended. You can view the final results.'
                              : status === 'cancelled'
                                ? 'This election has been cancelled by the administrator.'
                                : 'Election details are managed by your administrator.'}
                    </p>
                    <button
                      type='button'
                      disabled={status === 'cancelled' || status === 'upcoming'}
                      onClick={() => {
                        if (status === 'cancelled' || status === 'upcoming')
                          return;
                        if (hasVoted || isCompleted) {
                          navigate(`/results/${id}`);
                        } else {
                          navigate(`/vote/${id}`);
                        }
                      }}
                      className={`ml-4 inline-flex items-center px-3 py-2 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap ${
                        status === 'cancelled' || status === 'upcoming'
                          ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed focus:ring-gray-300'
                          : hasVoted
                            ? 'border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                            : isActive
                              ? 'border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                              : isCompleted
                                ? 'border-blue-500 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-500'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500'
                      }`}>
                      {status === 'cancelled' ? (
                        <>
                          <FiEye className='mr-1.5 h-3.5 w-3.5' />
                          <span>Cancelled</span>
                        </>
                      ) : status === 'upcoming' ? (
                        <>
                          <FiEye className='mr-1.5 h-3.5 w-3.5' />
                          <span>Not open yet</span>
                        </>
                      ) : hasVoted || isCompleted ? (
                        <>
                          <FiBarChart2 className='mr-1.5 h-3.5 w-3.5' />
                          <span>View results</span>
                        </>
                      ) : isActive ? (
                        <>
                          <FiCheckCircle className='mr-1.5 h-3.5 w-3.5' />
                          <span>Open ballot</span>
                        </>
                      ) : (
                        <>
                          <FiEye className='mr-1.5 h-3.5 w-3.5' />
                          <span>View details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;
