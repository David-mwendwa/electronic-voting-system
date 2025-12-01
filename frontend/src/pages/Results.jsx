import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import api from '../api/apiClient';
import { Spinner } from '../components/ui/Loaders';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiBarChart2,
  FiAward,
  FiUsers,
  FiCalendar,
  FiClock,
  FiHome,
  FiDownload,
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Results = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { getElectionById, loading: electionsLoading } = useElection();
  const [isLoading, setIsLoading] = useState(true);
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  const generateReport = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Dark blue
    doc.text(election.title, pageWidth / 2, 20, { align: 'center' });

    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99); // Gray 600
    doc.text('Election Results Report', pageWidth / 2, 30, { align: 'center' });

    // Add election details
    const rawEligibleFromBackend = Number(
      election?.eligibleVotersCount ?? election?.totalVoters ?? 0
    );
    const safeTotalVotes = Number(election?.voted ?? totalVotes ?? 0);

    // If backend doesn't provide a valid eligible count but there are votes,
    // fall back to treating all votes as from the eligible pool to avoid `of 0`.
    const safeTotalEligibleVoters =
      rawEligibleFromBackend > 0
        ? rawEligibleFromBackend
        : safeTotalVotes > 0
          ? safeTotalVotes
          : 0;

    const safeTurnout =
      safeTotalEligibleVoters > 0
        ? (safeTotalVotes / safeTotalEligibleVoters) * 100
        : 0;

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(
      `Election ID: ${election.id || election._id || electionId}`,
      15,
      45
    );
    doc.text(
      `Total Eligible Voters: ${safeTotalEligibleVoters.toLocaleString()}`,
      15,
      50
    );
    doc.text(`Votes Cast: ${safeTotalVotes.toLocaleString()}`, 15, 55);
    doc.text(`Turnout: ${safeTurnout.toFixed(1)}%`, 15, 60);

    // Add date and time
    const now = new Date();
    doc.text(
      `Report generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      pageWidth - 15,
      45,
      { align: 'right' }
    );

    // Add a line
    doc.setDrawColor(209, 213, 219); // Gray 300
    doc.setLineWidth(0.5);
    doc.line(15, 65, pageWidth - 15, 65);

    // Add results table
    const tableColumn = ['#', 'Candidate', 'Party', 'Votes', 'Percentage'];
    const tableRows = results.map((candidate, index) => [
      index + 1,
      candidate.name,
      candidate.party || 'Independent',
      candidate.votes.toLocaleString(),
      `${candidate.percentage.toFixed(1)}%`,
    ]);

    // Add table to document
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      margin: { left: 15, right: 15 },
      headStyles: {
        fillColor: [30, 58, 138], // Dark blue
        textColor: 255, // White
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Gray 50
      },
      didDrawPage: function (data) {
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128); // Gray 500
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });

    // Add winner section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74); // Green 600
    doc.text(
      isTie ? 'Election Results in a Tie' : 'Election Winner',
      15,
      finalY
    );

    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    if (isTie) {
      const tiedCandidates = results.filter(
        (r) => r.votes === leadingCandidate.votes
      );
      doc.text(
        `The following candidates are tied with ${leadingCandidate.votes} votes each:`,
        15,
        finalY + 10
      );

      tiedCandidates.forEach((candidate, index) => {
        doc.text(
          `${index + 1}. ${candidate.name} (${candidate.party || 'Independent'})`,
          20,
          finalY + 20 + index * 5
        );
      });
    } else {
      doc.text(
        `The winner is ${leadingCandidate.name} with ${leadingCandidate.percentage.toFixed(1)}% of the votes.`,
        15,
        finalY + 10
      );
    }

    // Save the PDF
    doc.save(`election-results-${election.id}.pdf`);
  };

  // Color palette for charts
  const chartColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ];

  useEffect(() => {
    const loadElection = async () => {
      try {
        // If elections are still loading in context, wait before resolving
        if (electionsLoading) {
          setIsLoading(true);
          return;
        }

        setIsLoading(true);

        // First try to get the election from context
        const contextElection = getElectionById(electionId);
        let foundElection = contextElection;

        // If not present in context (e.g. direct refresh) OR missing
        // backend-enriched fields like eligibleVotersCount, fetch from backend
        if (!foundElection || foundElection.eligibleVotersCount == null) {
          const response = await api.get(`/elections/${electionId}`);
          const remoteElection =
            response?.data?.data ||
            response?.data?.election ||
            response?.data ||
            response;

          if (!remoteElection) {
            toast.error('Election not found');
            navigate('/');
            return;
          }

          // Merge context election (which may contain client-updated results)
          // with the backend-enriched election (which has eligibleVotersCount,
          // voted, etc.). Prefer backend meta fields but keep non-empty
          // results from context if backend results are missing/empty.
          const backendResults = remoteElection?.results;
          const contextResults = contextElection?.results;

          // Helper to sum votes from a plain results map
          const getTotalFromResults = (resultsMap) => {
            if (!resultsMap || typeof resultsMap !== 'object') return 0;
            return Object.values(resultsMap).reduce(
              (sum, val) => sum + Number(val || 0),
              0
            );
          };

          const backendTotal = getTotalFromResults(backendResults);
          const contextTotal = getTotalFromResults(contextResults);

          // Prefer the source with higher total votes. This avoids replacing
          // non-zero client-side results with zero-valued backend results.
          let mergedResults = backendResults;
          if (contextTotal > backendTotal) {
            mergedResults = contextResults;
          }

          foundElection = {
            ...(contextElection || {}),
            ...(remoteElection || {}),
            ...(mergedResults ? { results: mergedResults } : {}),
          };
        }

        setElection(foundElection);

        // Process results from election.results map
        const resultsData = (foundElection.candidates || []).map(
          (candidate) => {
            const key = candidate._id || candidate.id;
            const votes = key ? foundElection.results?.[key] || 0 : 0;
            return {
              ...candidate,
              votes,
            };
          }
        );

        const total = resultsData.reduce((sum, c) => sum + c.votes, 0);

        const processedResults = resultsData
          .map((c) => ({
            ...c,
            percentage: total > 0 ? (c.votes / total) * 100 : 0,
          }))
          .sort((a, b) => b.votes - a.votes);

        setResults(processedResults);
        setTotalVotes(total);
      } catch (error) {
        console.error('Error loading election:', error);
        toast.error('Failed to load election data');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadElection();
  }, [electionId, navigate, getElectionById, electionsLoading]);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // While resolving the election (including on refresh), keep showing loader.
  // True not-found cases are handled in loadElection via toast + navigate('/').
  if (isLoading || !election) {
    return (
      <div className='min-h-screen bg-gray-50 pt-16 flex items-center justify-center'>
        <Spinner />
      </div>
    );
  }

  // Calculate statistics with safe fallbacks using backend-provided counts
  const rawEligibleFromBackend = Number(
    election?.eligibleVotersCount ?? election?.totalVoters ?? 0
  );

  const votesCount = Number(election?.voted ?? totalVotes ?? 0);

  // If backend doesn't provide a valid eligible count but there are votes,
  // fall back to treating all votes as from the eligible pool to avoid `of 0`.
  const totalEligibleVoters =
    rawEligibleFromBackend > 0
      ? rawEligibleFromBackend
      : votesCount > 0
        ? votesCount
        : 0;

  const turnout =
    totalEligibleVoters > 0 ? (votesCount / totalEligibleVoters) * 100 : 0;
  const leadingCandidate = results[0];
  const isTie = results.length > 1 && results[0].votes === results[1].votes;

  return (
    <div className='min-h-screen bg-gray-50 pt-16'>
      <div className='max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12'>
        {/* Header */}
        <div className='mb-4 sm:mb-6'>
          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mb-3 py-1.5'>
            <FiArrowLeft className='mr-1.5 h-4 w-4' /> Back
          </button>

          <div className='bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
              <div className='mb-4 md:mb-0'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                  {election.title}
                </h1>
                <p className='mt-1 text-sm sm:text-base text-gray-600 line-clamp-2'>
                  {election.description}
                </p>

                <div className='mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 text-xs sm:text-sm text-gray-500'>
                  <div className='flex items-center'>
                    <FiCalendar className='mr-1.5 h-3.5 w-3.5 flex-shrink-0' />
                    <span>
                      {formatDate(election.startDate)} -{' '}
                      {formatDate(election.endDate)}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <FiUsers className='mr-1.5 h-3.5 w-3.5 flex-shrink-0' />
                    <span>
                      {totalEligibleVoters.toLocaleString()} eligible voters
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-2 md:mt-0 bg-primary-50 px-3 py-2 sm:px-3 sm:py-2.5 rounded-md'>
                <div className='text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5'>
                  Turnout
                </div>
                <div className='flex items-baseline'>
                  <span className='text-xl sm:text-2xl font-bold text-primary-700'>
                    {turnout.toFixed(1)}%
                  </span>
                  <span className='ml-2 text-[11px] sm:text-xs text-gray-500'>
                    ({votesCount.toLocaleString()} of{' '}
                    {totalEligibleVoters.toLocaleString()} eligible voters)
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1.5'>
                  <div
                    className='bg-primary-600 h-full rounded-full'
                    style={{ width: `${Math.min(100, turnout)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
          {/* Results Summary */}
          <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
              <div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200'>
                <h2 className='text-base sm:text-lg font-medium text-gray-900 flex items-center'>
                  <FiBarChart2 className='mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary-600' />
                  Vote Distribution
                </h2>
              </div>
              <div className='px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4'>
                {results.map((candidate, index) => (
                  <div
                    key={candidate._id || candidate.id || index}
                    className='space-y-1.5'>
                    <div className='flex flex-col xs:flex-row xs:items-center xs:justify-between'>
                      <div className='flex items-center'>
                        <div
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${chartColors[index % chartColors.length]} mr-2`}></div>
                        <span className='text-sm sm:text-base font-medium text-gray-900 line-clamp-1'>
                          {candidate.name}
                          {index === 0 && !isTie && (
                            <span className='ml-1.5 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800'>
                              <FiAward className='mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3' />
                              {isTie ? 'Tied' : 'Leading'}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className='text-xs sm:text-sm text-gray-500 mt-0.5 xs:mt-0 xs:ml-2'>
                        {candidate.votes.toLocaleString()} votes (
                        {candidate.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className='w-full bg-gray-100 rounded-full h-2 sm:h-2.5'>
                      <div
                        className={`h-full rounded-full ${chartColors[index % chartColors.length]}`}
                        style={{ width: `${candidate.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Results Table */}
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
              <div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200'>
                <h2 className='text-base sm:text-lg font-medium text-gray-900'>
                  Detailed Results
                </h2>
              </div>
              <div className='overflow-x-auto -mx-2 sm:-mx-0'>
                <div className='inline-block min-w-full align-middle px-2 sm:px-0'>
                  <table className='min-w-full divide-y divide-gray-200 text-sm'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Candidate
                        </th>
                        <th
                          scope='col'
                          className='px-2 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Party
                        </th>
                        <th
                          scope='col'
                          className='px-2 py-2.5 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Votes
                        </th>
                        <th
                          scope='col'
                          className='px-2 py-2.5 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {results.map((candidate, index) => (
                        <tr
                          key={candidate._id || candidate.id || index}
                          className={
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }>
                          <td className='px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs sm:text-sm font-medium'>
                                {candidate.name.charAt(0)}
                              </div>
                              <div className='ml-2 sm:ml-3'>
                                <div className='text-xs sm:text-sm font-medium text-gray-900 line-clamp-1'>
                                  {candidate.name}
                                </div>
                                <div className='text-[10px] sm:text-xs text-gray-500'>
                                  #{index + 1}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-2 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500'>
                            {candidate.party || 'Ind'}
                          </td>
                          <td className='px-2 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm text-gray-900 font-medium'>
                            {candidate.votes.toLocaleString()}
                          </td>
                          <td className='px-2 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium'>
                            <span
                              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 inline-flex text-[10px] sm:text-xs leading-4 font-semibold rounded-full ${
                                index === 0 && !isTie
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                              {candidate.percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-4 sm:space-y-6'>
            {/* Winner Card */}
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
              <div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200'>
                <h2 className='text-base sm:text-lg font-medium text-gray-900 flex items-center'>
                  <FiAward className='mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500' />
                  {isTie ? 'Tied Candidates' : 'Election Winner'}
                </h2>
              </div>
              <div className='p-4 sm:p-5'>
                {isTie ? (
                  <div className='text-center'>
                    <div className='mx-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mb-3'>
                      <FiAward className='h-5 w-5 sm:h-6 sm:w-6' />
                    </div>
                    <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-1.5'>
                      Tied Election
                    </h3>
                    <p className='text-xs sm:text-sm text-gray-600 mb-3'>
                      Top{' '}
                      {
                        results.filter(
                          (r) => r.votes === leadingCandidate.votes
                        ).length
                      }{' '}
                      candidates tied with {leadingCandidate.votes} votes each.
                    </p>
                    <div className='space-y-2'>
                      {results
                        .filter((r) => r.votes === leadingCandidate.votes)
                        .map((candidate, index) => (
                          <div
                            key={candidate._id || candidate.id || index}
                            className='flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg'>
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${chartColors[index % chartColors.length]} flex items-center justify-center text-white font-medium text-xs sm:text-sm`}>
                              {candidate.name.charAt(0)}
                            </div>
                            <div className='ml-2 sm:ml-3 min-w-0'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900 truncate'>
                                {candidate.name}
                              </div>
                              <div className='text-[10px] sm:text-xs text-gray-500 truncate'>
                                {candidate.party || 'Independent'}
                              </div>
                            </div>
                            <div className='ml-auto text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap pl-2'>
                              {candidate.percentage.toFixed(1)}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className='text-center'>
                    <div className='mx-auto h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-3 sm:mb-4'>
                      <FiAward className='h-10 w-10 sm:h-12 sm:w-12' />
                    </div>
                    <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-1'>
                      {leadingCandidate.name}
                    </h3>
                    <p className='text-sm text-gray-600 mb-3 sm:mb-4'>
                      {leadingCandidate.party || 'Independent'}
                    </p>
                    <div className='bg-green-50 rounded-lg p-3'>
                      <div className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>
                        Votes Received
                      </div>
                      <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-center'>
                        <span className='text-xl sm:text-2xl font-bold text-green-700'>
                          {leadingCandidate.votes.toLocaleString()}
                        </span>
                        <span className='text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-0 sm:ml-2'>
                          ({leadingCandidate.percentage.toFixed(1)}% of total)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Election Stats */}
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
              <div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200'>
                <h2 className='text-base sm:text-lg font-medium text-gray-900'>
                  Election Stats
                </h2>
              </div>
              <div className='p-4 sm:p-5 space-y-3 sm:space-y-4'>
                <div>
                  <div className='text-xs sm:text-sm font-medium text-gray-500'>
                    Total Votes Cast
                  </div>
                  <div className='mt-0.5 text-lg sm:text-xl font-semibold text-gray-900'>
                    {totalVotes.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className='text-xs sm:text-sm font-medium text-gray-500'>
                    Voter Turnout
                  </div>
                  <div className='mt-0.5'>
                    <div className='text-lg sm:text-xl font-semibold text-gray-900'>
                      {turnout.toFixed(1)}%
                    </div>
                    <div className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                      {votesCount.toLocaleString()} of{' '}
                      {totalEligibleVoters.toLocaleString()} eligible voters
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2'>
                    <div
                      className='bg-primary-600 h-full rounded-full'
                      style={{ width: `${Math.min(100, turnout)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className='text-xs sm:text-sm font-medium text-gray-500 mb-1'>
                    Voting Period
                  </div>
                  <div className='space-y-1 text-xs sm:text-sm'>
                    <div className='flex items-start'>
                      <FiCalendar className='mt-0.5 mr-1.5 h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
                      <span>{formatDate(election.startDate)}</span>
                    </div>
                    <div className='flex items-start'>
                      <FiCalendar className='mt-0.5 mr-1.5 h-3.5 w-3.5 text-gray-400 flex-shrink-0' />
                      <span>{formatDate(election.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
              <div className='px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200'>
                <h2 className='text-base sm:text-lg font-medium text-gray-900'>
                  Actions
                </h2>
              </div>
              <div className='p-4 space-y-2'>
                <button
                  onClick={() => window.print()}
                  className='w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:bg-gray-100 transition-colors'>
                  <svg
                    className='mr-2 h-4 w-4 text-gray-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                    />
                  </svg>
                  Print Results
                </button>
                <button
                  onClick={generateReport}
                  className='w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:bg-primary-800 transition-colors'>
                  <FiDownload className='mr-2 h-4 w-4' />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-6 sm:mt-8 text-center text-xs text-gray-500 pb-4 sm:pb-6'>
          <p>
            Results as of {new Date().toLocaleDateString()} at{' '}
            {new Date().toLocaleTimeString()}
          </p>
          <p className='mt-0.5'>Election ID: {electionId}</p>
        </div>
      </div>
    </div>
  );
};

export default Results;
